var path = require('path'),
    fs = require('fs'),
    lockfile = require('lockfile'),
    async = require('async');

function mkdirIfNeeded(parent, dir, callback) {
  var p = path.join(parent, dir);
  fs.exists(p, function(exists){
    if(!exists){
      fs.mkdir(p, function(err) {
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

function loadPostFromFile(file, callback) {
  fs.readFile(file, function(err, data){
    if(err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function getPosts(callback) {
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

function getStoreFolder(callback) {
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

  async.waterfall([
    getStoreFolder, getFilePath, safeWrite],
    function(err){
      if(err){
        next('Cannot save post');
        return;
      }
      res.header("Content-Type", "application/json");
      res.send({
        status: 'saved',
        location: '/post/' + id + '.json'
      });
    });

  function getFilePath(directory, cb) {
    cb(null, path.join(directory, id + '.json'));
  }

  function safeWrite(filepath, cb) {
    async.applyEachSeries([lock, write, unlock], filepath, cb);
  }

  function lock(filepath, cb) {
    lockfile.lock(filepath+'.lock', {
      wait: 300,
      retryWait: 100,
      retries: 5
    }, cb);
  }

  function unlock(filepath, cb) {
    lockfile.unlock(filepath+'.lock', cb);
  }

  function write(filepath, cb) {
    var content = JSON.stringify(body, null, 2);
    var buffer = new Buffer(content);
    fs.writeFile(filepath, content, cb);
  }
}

function loadPost(req, res, next){
  var id = req.params.id;
  var body = req.body;
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

function create(server, options) {
  server.post('/' + options.mountPoint + '/:id.json', savePost);
  server.get('/' + options.mountPoint + '/:id.json', loadPost);
  server.get('/' + options.mountPoint + '.json', listPosts);
}


module.exports = {
  create: create
};