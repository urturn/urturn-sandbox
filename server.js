var express = require('express');
var path = require('path');

var expression = require('./routes/expression');
var post = require('./routes/post');


function configure(expressionDir, port){
  var app = express();

  app.configure(function(){
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express['static'](path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  // Routing
  app.get('/lib/:lib/*', function(req, res){
    var distdir = require(req.params.lib).directory;
    res.sendfile(distdir + '/' + req.params[0]);
  });

  app.get('/image_proxy/*', function(req, res){
    //http://localhost:3333/image_proxy/lorempixel.com/576/600
    parts = req.params[0].split('/');
    var host = parts.shift();
    var url = '/' + parts.join('/');

    //http://www.catonmat.net/http-proxy-in-nodejs/var proxy = http.createClient(80, request.headers['host'])
    var http = require('http');
    var proxy = http.createClient(80, host);
    req.headers.host = host;
    var proxy_request = proxy.request('GET', url, req.headers);
    proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        res.write(chunk, 'binary');
      });
      proxy_response.addListener('end', function() {
        res.end();
      });
      res.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    req.addListener('data', function(chunk) {
      proxy_request.write(chunk, 'binary');
    });
    req.addListener('end', function() {
      proxy_request.end();
    });
  });

  var expressionApp = expression.create(app, {
    path: expressionDir,
    mountPoint: 'expression'
  });

  var postApp = post.create(app, {mountPoint: 'post'});
  return app;
}

http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(8000);

module.exports = {
  configure: configure
};