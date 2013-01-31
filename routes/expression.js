var fs    = require('fs')
  , path  = require('path')
  ;

var Expression = function(expressionDir, info){
  this.path = expressionDir;
  this.title = info.title;
  this.system_name = info.system_name;
  this.version = info.version;
  this.description = info.description;
  this.dependencies = info.dependencies;
};

function ExpressionController(expression) {

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
      fs.readFile(path.join(expression.path, mode + '.html'), function(err, data){
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

    // The callback receive err, scripts and stylesheets
    // scripts contains on script path per script and
    // stylesheets one css file path for every stylesheet
    var findResourcePaths = function(callback){
      var deps = expression.dependencies;
      var paths = { stylesheet: [], javascript: [] };
      for (var i in deps){
        var dep = deps[i];
        if(!dep.context || dep.context == mode){
          try {
            paths[dep.type].push(dep.path);
          } catch (e){
            console.log(e);
            callback('Cannot load ' + dep.path + ', wrong type specified: ' + dep.type);
            return
          }
        }
      }
      callback(null, paths.javascript, paths.stylesheet);
    };

    var renderAfterLoading = function(){
      wait --;
      if(wait === 0){
        console.log(resources);
        res.render('iframe', {
          title: expression.title,
          scripts: resources.scripts,
          stylesheets: resources.stylesheets,
          head: templates.head,
          body: templates.body
        });
      }
    }

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
        description: expression.description
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
};

// Instantiate an ExpressionController asynchronously.
var createExpressionController = function(expression, callback){
  var controller = new ExpressionController(expression);
  callback.call(controller, null, controller);
};

var createExpression = function(expressionDir, callback){
  fs.readFile(path.join(expressionDir, 'expression.json'), function(err, data){
    if(err){
      callback(err, null);
    } else {
      var json = JSON.parse(data);
      var expression = new Expression(expressionDir, json);
      callback.call(expression, null, expression);
    }
  });
};

// Dynamically instantiate the expression and the controller on each requests.
var route = function(expressionDir, routeName){
  return function(req, res, next) {
    createExpression(expressionDir, function(err){
      if(err){
        console.log(err);
        next('Cannot create expression');
      }
      createExpressionController(this, function(err){
        if(err){
          console.log(err);
          next('Cannot create expression controller');
        }
        this.routes[routeName](req, res, next);
      });
    });
  };
};

module.exports = {
  route: route
};