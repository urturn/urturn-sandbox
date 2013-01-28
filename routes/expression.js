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
    loadInfo(function(err, info){
      if(err){
        console.log(err);
        next("Cannot read expression.json")
      } else {
        res.render('iframe', {
          title: info.title
        });
      }
    });
  };
}

exports.ExpressionController = ExpressionController;