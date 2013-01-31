var fs    = require('fs')
  , path  = require('path')
  ;

function ExpressionController(expressionDir){
  var self = this;

  // Read expression.json
  var loadInfo = function(callback){
    fs.readFile(path.join(expressionDir, 'expression.json'), function(err, data){
      if(err){
        callback(err, null);
      } else {
        var json = JSON.parse(data);
        callback.call(json, null, json);
      }
    });
  };

  var compileTemplate = function(source){
    return source.replace(/\{\{assets_root_path\}\}/g, '.');
  }

  // Load a template file for the given mode and pass err, head and body to the callback.
  // The head is defined only if there is a head section in the template.
  var loadTemplate = function(info, mode, callback){
    fs.readFile(path.join(expressionDir, mode + '.html'), function(err, data){
      if(err){
        callback(err);
      } else {
        var partials = data.toString().match(/<head>(.*)<\/head><body>(.*)<\/body>/mg);
        if(partials){
          callback(null, compileTemplate(partials[1]), compileTemplate(partials[2]));
        } else {
          callback(null, null, compileTemplate(data.toString()));
        }
      }
    });
  };

  // The callback receive err, scripts and stylesheets
  // scripts contains on script path per script and
  // stylesheets one css file path for every stylesheet
  var loadResources = function(info, mode, callback){
    var deps = info.dependencies;
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

  // Render player or editor template iframe
  var template = function(mode, req, res, next){
    loadInfo(function(err, info){
      var wait = 2
        , templates = {}
        , resources = {}
        ;

      var renderAfterLoading = function(){
        wait --;
        if(wait === 0){
          console.log(resources);
          res.render('iframe', {
            title: info.title,
            scripts: resources.scripts,
            stylesheets: resources.stylesheets,
            head: templates.head,
            body: templates.body
          });
        }
      }

      loadTemplate(info, mode, function(err, th, tb){
        if(err){
          console.log(err);
          next("Cannot load templates");
          return;
        }
        templates.head = th;
        templates.body = tb;
        renderAfterLoading();
      });

      loadResources(info, mode, function(err, scripts, stylesheets){
        if(err){
          console.log(err);
          next("Cannot load resources");
          return;
        }
        resources.scripts = scripts;
        resources.stylesheets = stylesheets;
        renderAfterLoading();
      });
    });
  };

  self.asset = function(req, res, next){
    assetPath = req.params[0];
    if(!path){
      next("No asset path provided");
    } else {
      console.log(path.join(expressionDir, assetPath))
      res.sendfile(path.join(expressionDir, assetPath));
    }
  }

  // Display title, description, version and banner of the current expression.
  self.info = function(req, res, next){
    loadInfo(function(err, info){
      if(err){
        console.log(err);
        next("Cannot read expression.json")
      } else {
        res.render('index', {
          system_name: info.system_name,
          title: info.title,
          banner: './banner.png',
          version: info.version,
          description: info.description
        });
      }
    });
  };

  self.player = function(req, res, next){
    template('player', req, res, next);
  };

  self.editor = function(req, res, next){
    template('editor', req, res, next);
  };
}

exports.ExpressionController = ExpressionController;