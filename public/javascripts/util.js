(function(sandbox){
  "use strict";

  sandbox.compile = function(html, context){
    return $(html.replace(/\$([a-zA-Z]+)/g, function(m){
      var k = m.substring(1);
      return (context[k] !== undefined ? context[k] : m);
    })).get(0);
  };

  sandbox.log = function(){
    if(window.console && console.log){
      if(console.log.apply){
        console.log.apply(console, arguments);
      } else {
        console.log(Array.prototype.join.apply(arguments, ' '));
      }
    }
  };

}(sandbox));