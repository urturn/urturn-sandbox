#!/usr/bin/env node

/**
 * Module dependencies.
 */

var http = require('http')
  , program = require('commander')
  , path = require('path')
  , fs = require('fs')
  ;

var info = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

program
  .version(info.version);

program
  .command('start [path]')
  .description('start the sandbox server')
  .option('-p, --port <port>', Number)
  .action(function(p, context){
    var port = program.port || process.env.PORT || 3333;
    var expressionDir = path.resolve(p) || process.cwd().toString();
    var server = require('./server').configure(expressionDir, port);
    http.createServer(server).listen(server.get('port'), function(){
      console.log("Express server listening on port " + server.get('port'));
    });
  });

program.parse(process.argv);