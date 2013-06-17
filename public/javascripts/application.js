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

  this.navigate = function(path, pushState){
    if(pushState === undefined){
      pushState = true;
    }
    if(path === undefined && window.location.hash.indexOf('#!') === 0){
      path = window.location.hash.substring(2);
    }
    if(!path){
      path = '';
    }
    for(var i in routes){
      var matches = path.match(routes[i].re);
      if(matches){
        var context = {};
        var keys = routes[i].pattern.match(/:([^\/\.]+)/g);
        for(var j = 0; keys && j < keys.length; j++){
          context[keys[j].substring(1)] = matches[j+1];
        }
        routes[i].callback(context);
        if(pushState){
          if(window.history && window.history.pushState){
            window.history.pushState({path: path, context: context}, null, '#!' + path);
          }
        }
        return;
      }
    }
    sandbox.log('Unable to navigate to ' + path);
  };

  window.addEventListener('popstate', function(event){
    if(event.state && event.state.path !== undefined){
      this.navigate(event.state.path, false);
    }
  }.bind(this));

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