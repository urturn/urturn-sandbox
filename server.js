var express = require('express')
  , expression = require('./routes/expression')
  , path = require('path')
  ;

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
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  // Routing
  app.get('/lib/:lib/*', function(req, res){
    res.sendfile(path.join(__dirname, 'node_modules/' + req.params.lib + '/dist/' + req.params[0]));
  });

  app.get('/', expression.route(expressionDir, 'info'));
  app.get('/expression/player.html', expression.route(expressionDir, 'player'));
  app.get('/expression/editor.html', expression.route(expressionDir, 'editor'));
  app.get('/expression/*', expression.route(expressionDir, 'asset'))
  return app;
}

module.exports = {
  configure: configure
};