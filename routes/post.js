var path = require('path');
var fs = require('fs');

function getStoreFolder(callback){
  function mkdirIfNeeded(parent, dir, callback){
    var p = path.join(parent, dir);
    fs.exists(p, function(exists){
      if(!exists){
        fs.mkdir(p, function(err){
          if(err){
            callback(err);
          } else {
            callback(null, p);
          }
        });
      } else {
        callback(null, p);
      }
    });
  }

  mkdirIfNeeded(process.cwd(), '.urturn', function(err, dir){
    if(err){ return callback(err); }
    mkdirIfNeeded(dir, 'posts', function(err, dir){
      if(err){ return callback(err); }
      mkdirIfNeeded(dir, body.expression.system_name, function(err, dir){
        if(err){ return callback(err); }
        callback(null, dir);
      });
    });
  });
}

function savePost(req, res, next){
  var id = req.params.id;
  var body = req.body;
  console.log(body);
  getStoreFolder(function(err, dir){
    if(err){
      console.log(err);
      next("Cannot find data folder");
    } else {
      fs.writeFile( path.join(dir, id + '.json'), JSON.stringify(body), function(err){
        if(err){
          console.log(err);
          next("Cannot save post");
        } else {
          res.send('OK');
        }
      });
    }
  });
}

function create(server, options){
  server.post('/' + options.mountPoint + '/:id.json', savePost);
}

module.exports = {
  create: create
};