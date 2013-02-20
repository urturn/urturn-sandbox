// Application handle the global sandbox lifecycle.
// rootNode must declare the following markup:
// - .iframe-expression class on an iframe tag
sandbox.Application = function(rootNode){
  // Hold rules to route
  var routes = [];
  this.addRoute = function(pattern, func){
    var route = {};
    route.pattern = pattern;
    route.re = new RegExp('^' + pattern.replace(/(:[^\/\.]+)/g, '([^\\/\\.]+)') + '$');
    route.callback = func;
    routes.push(route);
  };

  this.navigate = function(path){
    if(!path && window.location.hash.indexOf('#!') === 0){
      path = window.location.hash.substring(2);
    }
    if(!path){
      return;
    }
    for(var i in routes){
      var matches = path.match(routes[i].re);
      if(matches){
        var context = {};
        var keys = routes[i].pattern.match(/:([^\/\.]+)/g);
        for(var j = 0; keys && j < keys.length; j++){
          context[keys[j].substring(1)] = matches[j+1];
        }
        console.log(context);
        routes[i].callback(context);
        window.history.pushState({path: path, context: context}, null, '#!' + path);
        return;
      }
    }
    console.log('Unable to navigate to ' + path);
  };

  // Zone
  var nodes = {};
  var zones = {};
  this.addZone = function(name, selector){
    var node = document.querySelector(selector);
    if(!node){
      throw "DOM node cannot be found for selector " + selector;
    }
    nodes[name] = document.querySelector(selector);
  };

  this.assignZone = function(zone, controller){
    if(zones[zone]){
      zones[zone].detach(nodes[zone]);
    }
    nodes[zone].innerHTML = "";
    controller.attach(nodes[zone]);
    zones[zone] = controller;
  };

};