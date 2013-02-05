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
    app.use(express.favicon());
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
    res.sendfile(path.join(__dirname, 'node_modules/' + req.params.lib + '/dist/' + req.params[0]));
  });

  var expressionApp = expression.create(app, {
    path: expressionDir,
    mountPoint: 'expression'
  });

  var postApp = post.create(app, {mountPoint: 'post'});
  console.log(app.routes);
  return app;
}

module.exports = {
  configure: configure
};