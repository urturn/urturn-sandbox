var fs    = require('fs'),
    path  = require('path'),
    glob  = require('glob'),
    async = require('async');

var Expression = function(expressionDir, info){
  this.location = expressionDir;
  this.systemName = info.system_name;
  this.version = info.version;
  this.apiVersion = info.api_version;
  this.title = info.title;
  this.description = info.description;
  this.dependencies = info.dependencies;
  this.bannerPath = info.bannerPath;
  this.collections = info.collections;
};

function ExpressionController(cwd, expression) {

  // Render player or editor template iframe
  var template = function(mode, req, res, next){

    var wait = 2,
        templates = {},
        resources = {};

    // Strip out {{tags}} and replace them by their values.
    // Currently only support {{assets_root_path}}
    var compile = function(source){
      return source.replace(/\{\{assets_root_path\}\}/g, '.');
    };

    // Load a template file for the given mode and pass err, head and body to the callback.
    // The head is defined only if there is a head section in the template.
    var loadTemplates = function(callback){
      fs.readFile(path.join(cwd, expression.location, mode + '.html'), function(err, data){
        if(err){
          callback(err);
        } else {
          var partials = data.toString().match(/<head>(.*)<\/head><body>(.*)<\/body>/mg);
          if(partials){
            callback(null, compile(partials[1]), compile(partials[2]));
          } else {
            callback(null, null, compile(data.toString()));
          }
        }
      });
    };

    // retrieve the internal mode or throw if an invalid string is provided.
    var getContextMode = function(mode){
      if(['player', 'editor'].indexOf(mode) === -1){
        throw new Error("invalid context " + mode);
      }
      return mode;
    };

    // The callback receive err, scripts and stylesheets
    // scripts contains on script path per script and
    // stylesheets one css file path for every stylesheet
    var findResourcePaths = function(callback){
      var deps = expression.dependencies;
      var paths = { css: [], js: [] };
      var contextMode = getContextMode(mode);
      for (var i in deps){
        var dep = deps[i];
        if(!dep.context || dep.context == contextMode){
          try {
            if(!dep.path){
              throw new Error('missing path for dependency ' + JSON.stringify(dep));
            }
            paths[dep.path.match(/\.([a-z]+)$/)[1]].push(dep.path);
          } catch (e){
            console.log(e);
            callback(new Error('Cannot load ' + dep.path));
            return;
          }
        }
      }
      callback(null, paths.js, paths.css);
    };

    var apiPath = function(){
      var p = path.resolve(__dirname, '../public/api/' + expression.apiVersion);
      console.log(p);
      if(fs.existsSync(p)){
        return '/api/' + expression.apiVersion;
      } else {
        return '/lib/urturn-expression-api';
      }
    };

    var renderAfterLoading = function(){
      wait --;
      if(wait === 0){
        res.render('iframe', {
          title: expression.title,
          scripts: resources.scripts,
          stylesheets: resources.stylesheets,
          apiPath: apiPath(),
          head: templates.head,
          body: templates.body
        });
      }
    };

    loadTemplates(function(err, th, tb){
      if(err){
        console.log(err);
        next("Cannot load templates");
        return;
      }
      templates.head = th;
      templates.body = tb;
      renderAfterLoading();
    });

    findResourcePaths(function(err, scripts, stylesheets){
      if(err){
        console.log(err);
        next("Cannot load resources");
        return;
      }
      resources.scripts = scripts;
      resources.stylesheets = stylesheets;
      renderAfterLoading();
    });
  };

  this.routes = {
    // Retrieve one of the expression assets given its path
    asset: function(req, res, next){
      assetPath = req.params[0];
      if(!path){
        next("No asset path provided");
      } else {
        res.sendfile(path.join(expression.path, assetPath));
      }
    },
    // Display title, description, version and banner of the current expression.
    // Also provide link to create new post. This is the entry point route for
    // the expression.
    info: function(req, res, next){
      res.render('index', {
        system_name: expression.system_name,
        title: expression.title,
        banner: './banner.png',
        version: expression.version,
        description: expression.description,
        collections: expression.collections
      });
    },
    // Render the player page to be display in the iframe
    player: function(req, res, next){
      template('player', req, res, next);
    },
    // Render the editor page to be display in the iframe
    editor: function(req, res, next){
      template('editor', req, res, next);
    }
  };
}

// Instantiate an ExpressionController asynchronously.
var createExpressionController = function(cwd, expression, callback){
  var controller = new ExpressionController(cwd, expression);
  callback.call(controller, null, controller);
};

var createExpression = function(cwd, expressionDir, callback){
  function bannerPath(cwd, expressionDir){
    // Try to find a banner
    var imageTypes = ['png', 'jpg', 'jprg', 'gif'];
    for(var i = 0; i < imageTypes.length; i++){
      var relPath = expressionDir + '/' + 'resources/banner.' + imageTypes[i];
      if(fs.existsSync(path.join(cwd, relPath))){
        return relPath;
      }
    }
  }
  var p = path.join(cwd, expressionDir, 'expression.json');
  fs.readFile(p, function(err, data){
    if(err){
      callback(err, null);
    } else {
      var json;
      try {
        json = JSON.parse(data);
      } catch (e){
        console.log('Error while parsing ' + p);
        throw e;
      }
      json.bannerPath = bannerPath(cwd, expressionDir);
      var expression = new Expression(expressionDir, json);
      callback.call(expression, null, expression);
    }
  });
};

var ExpressionApplication = function(server, mount, expPath) {
  var self = this;

  // Instantiate and route to an expression controller
  var routeToControllerFunc = function(cwd, route){
    return function(req, res, next){
      createExpression(cwd, req.params[0] || '.', function(err){
        if(err){
          console.log(err);
          next('Cannot create expression');
        } else {
          createExpressionController(cwd, this, function(err){
            if(err){
              console.log(err);
              next('Cannot create expression controller');
            } else {
              this.routes[route](req, res, next);
            }
          });
        }
      });
    };
  };

  this.list = function(req, res, next){
    descriptors = glob("**/expression.json", {cwd: expPath}, function(err, matches){
      var constructors = [];
      function createFunc(dir){
        return function(cb) {
          return createExpression(expPath, dir, cb);
        };
      }

      for(var i in matches){
        var expDirPath = path.dirname(matches[i]);
        constructors.push(createFunc(expDirPath));
      }

      async.parallel(constructors, function(err, expressions){
        if(err){
          console.log(err);
          next("Cannot retrieve expression list");
        }
        res.send({expressions: expressions});
      });
    });
  };

  this.asset = function(req, res, next){
    if(fs.existsSync(path.join(expPath, req.params[0]))){
      res.sendfile(path.join(expPath, req.params[0]));
    } else {
      next("Resource not found: " + req.params[0], 404);
    }
  };

  // routing
  server.get('/' + mount + '.json', this.list);
  server.get('/' + mount + '/*/?player.html', routeToControllerFunc(expPath, 'player'));
  server.get('/' + mount + '/*/?editor.html', routeToControllerFunc(expPath, 'editor'));
  server.get('/' + mount + '/*', this.asset);
};

ExpressionApplication.create = function(server, options) {
  var app = new ExpressionApplication(server, options.mountPoint || 'expression', options.path || process.cwd());
  return app;
};

module.exports = {
  create: ExpressionApplication.create
};