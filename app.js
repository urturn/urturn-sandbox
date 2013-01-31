#!/usr/bin/env node

/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , program = require('commander')
  , path = require('path')
  , fs = require('fs')
  , expression = require('./routes/expression')
  ;

var info = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

program
  .version(info.version)

program
  .command('start [path]')
  .description('start the sandbox server')
  .option('-p, --port <port>', Number)
  .action(function(p, context){
    var port = program.port || process.env.PORT || 3333;
    var p = path.resolve(p) || process.cwd().toString();
    startServer(p, port);
  });

function startServer(expressionDir, port){
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

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}

program.parse(process.argv);