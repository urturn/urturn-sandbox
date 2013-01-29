
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
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
  .action(function(path, context){
    var port = program.port || process.env.PORT || 3000;
    var path = path || process.cwd().toString();
    startServer(path, port);
  });

function startServer(expressionDir, port){
  var app = express();
  var expressionController = new expression.ExpressionController(expressionDir)

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

  app.get('/', expressionController.info);
  app.get('/expression/player.html', expressionController.player);
  app.get('/expression/*', expressionController.asset)
  app.get('/lib/urturn-expression-api.min.:extension', function(req, res){
    res.sendfile(path.join(__dirname, 'node_modules/urturn-expression-api/dist/urturn-expression-api.min.' + req.params.extension));
  });

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}

program.parse(process.argv);