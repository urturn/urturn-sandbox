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

  sandbox.get_random_color = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  };

}(sandbox));