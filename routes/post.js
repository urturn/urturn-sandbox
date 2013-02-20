var path = require('path');
var fs = require('fs');

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

function loadPostFromFile(file, callback){
  fs.readFile(file, function(err, data){
    if(err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function getPosts(callback){
  getStoreFolder(function(err, dir){
    if(err){
      return callback(err);
    }
    fs.readdir(dir, function(err, list){
      if(err) return callback(err);
      var pending = list.length;
      var results = [];
      if(!pending) return callback(null, results);
      list.forEach(function(file){
        file = path.join(dir, file);
        fs.stat(file, function(err, stats){
          if(err) return callback(err);
          if(file.match(/.json$/) && stats.isFile()){
            loadPostFromFile(file, function(err, post){
              if(err) return callback(err);
              results.push(post);
              pending --;
              if(pending === 0){
                callback(null, results);
              }
            });
          } else {
            pending --;
            if(pending === 0){
              callback(null, results);
            }
          }
        });
      });
    });
  });
}

function getStoreFolder(callback){
  mkdirIfNeeded(process.cwd(), '.urturn', function(err, dir){
    if(err){ return callback(err); }
    mkdirIfNeeded(dir, 'posts', function(err, dir){
      if(err){ return callback(err); }
      callback(null, dir);
    });
  });
}

function savePost(req, res, next){
  var id = req.params.id;
  var body = req.body;
  console.log(body);
  getStoreFolder(function(err, dir){
    if(err){
      next(err);
    } else {
      fs.writeFile( path.join(dir, id + '.json'), JSON.stringify(body), function(err){
        if(err){
          console.log(err);
          next("Cannot save post");
        } else {
          res.header("Content-Type", "application/json");
          res.send({
            status: 'saved',
            location: '/post/' + id + '.json'
          });
        }
      });
    }
  });
}

function loadPost(req, res, next){
  var id = req.params.id;
  var body = req.body;
  console.log(body);
  getStoreFolder(function(err, dir){
    if(err){
      next(err);
    } else {
      fs.readFile ( path.join(dir, id + '.json'), function(err, data){
        if(err){
          next(err);
        } else {
          res.header("Content-Type", "application/json");
          res.send(data);
        }
      });
    }
  });
}

function listPosts(req, res, next){
  getPosts(function(err, posts){
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({posts: posts}));
  });
}

function create(server, options){
  server.post('/' + options.mountPoint + '/:id.json', savePost);
  server.get('/' + options.mountPoint + '/:id.json', loadPost);
  server.get('/' + options.mountPoint + '.json', listPosts);
  // server.get('/' + options.mountPoint + '/:expression.json', listPost);
}

module.exports = {
  create: create
};