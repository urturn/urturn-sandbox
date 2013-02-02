var sandbox = {};

// Application handle the global sandbox lifecycle.
// rootNode must declare the following markup:
// - .iframe-expression class on an iframe tag
sandbox.Application = function(rootNode){
  var currentUser = new sandbox.User.create();
  var expressionList = new sandbox.ExpressionListController(rootNode.querySelector('.expression-list'));
  var expressionFrame = new sandbox.ExpressionFrameController(rootNode.querySelector('.expression-frame'), currentUser);

  expressionList.attach();
  expressionFrame.attach();

  expressionList.onSelected = function(expression){
    expressionFrame.load('/expression/' + expression.location + '/editor.html');
  }
};

sandbox.Post = function(){
  this.title = "";
  this.uuid = null;
  this.collections = [
    {
      name: 'default',
      items: [],
      count: 0
    }
  ]
}

sandbox.User = function(){
  this.uuid = null;
}

sandbox.User.create = function(){
  var u = new sandbox.User();
  u.uuid = UT.uuid();
  return u;
}

sandbox.ExpressionFrameController = function(iframeNode, currentUser){

  // hold the post currently displayed.
  var post = null;

  // api that respond to postMessage
  var api = {
    container: {
      setTitle: function(title){
        console.log('implement setTitle');
      },

    },
    collections: {
      save: function(){
        console.log('implement save');
      }
    },
    changeCurrentState: function(){
      console.log('implement save');
    }
  }

  var sendReadyMessage = function(post){
    var readyMessage = {
      type: 'ready',
      // This will become the _states properties
      // XXX This should be named initialState
      // XXX wow, need to do something with this messy code.
      options: {
        expToken: UT.uuid(),
        mode: 'editor',
        documentURL: '/posts/' + post.uuid,
        documentId: post.uuid,
        documentPrivacy: 'public',
        collections: post.collections,
        currentUserId: currentUser.uuid,
        host: 'http://localhost:3333',
        assetPath: 'http://expressions',
        note : post.note,
        scrollValues: {} // XXX Need to be imported
      }
    };

    iframeNode.contentWindow.postMessage(JSON.stringify(readyMessage), "*");
  }

  this.attach = function(){
    window.addEventListener("message", function (e) {
      try {
        msgObj = JSON.parse(e.data);
      }
      catch (exception) {
        if (console && console.error) {
          console.error("receive invalid message", e.data, exception.message) ;
        }
        msgObj = {};
      }
      console.log("Received message in parent frame", msgObj);
      
      var callPath = msgObj.methodName.split('.');
      var args = msgObj.args;
      args.push(function(){
        iframe.window.postMessage(JSON.stringify({type:'todo'}), '*');
      });
      var func = api;
      for(var i = 0; i < callPath.length; i++){
        func = func[callPath[i]];
      }
      func.apply(post, args);
      //_dispatch(msgObj);
    }, false);
  }

  this.load = function(src, callback){
    async.parallel([
      // Wait for iframe
      function(cb){ 
        var waitLoaded = function(event, callback){
          iframeNode.removeEventListener('load', waitLoaded, false);
          cb(null, true);
        };
        iframeNode.addEventListener('load', waitLoaded, false); 
      },
      // Create a post
      function(cb){
        post = new sandbox.Post();
        post.uuid = UT.uuid();
        cb(null, post)
      }
    ], function(err, results){
      console.log('loaded', err, results);
      sendReadyMessage(results[1]);
    });

    console.log('load', src)
    iframeNode.src = src;
  }
};

// Expression Model constructor
sandbox.Expression = function(pObject){
  this.systemName = null;
  this.version = null;
  this.title = null;
  this.description = null;
  this.location = null;
};

// Instantiate an expression from JSON data
sandbox.Expression.fromJSON = function(pObject){
  var expression = new sandbox.Expression();
  expression.title = pObject.title;
  expression.description = pObject.description;
  expression.version = pObject.version;
  expression.systemName = pObject.systemName;
  expression.location = pObject.location;
  expression.bannerPath = pObject.bannerPath;
  return expression;
};

sandbox.compile = function(html, context){
  return html.replace(/\$([a-zA-Z]+)/g, function(m){
    var k = m.substring(1)
    return (context[k] !== undefined ? context[k] : m);
  });
}

sandbox.ExpressionController = function(expression, ulNode){
  var self = this;
  var liNode;
  var itemTemplate = '<h4 class="expression-item-title">$title</h4><img src="expression/$bannerPath" /><div>$systemName-$version</div><div>$description</div>';
  var handleSelected = function(){
    if(self.onSelected){
      self.onSelected.call(self, expression)
    } else {
      console.log("onSelected not bound");
    }
  }
  this.attach = function(){
    liNode = document.createElement('li');
    liNode.innerHTML = sandbox.compile(itemTemplate, expression);
    ulNode.appendChild(liNode);
    liNode.addEventListener('click', handleSelected);
  };
  this.detach = function(){
    if(liNode){
      ulNode.removeChild(liNode);
    }
  }

  this.onSelected = null;
};

sandbox.ExpressionListController = function(ulNode){
  var self = this;
  var expressionControllers = [];

  var handleSelected = function(expression){
    if(self.onSelected){
      self.onSelected.call(self, expression);
    } else {
      console.log("onSelected not bound");
    }
  }

  // handle a list server response
  var handleListReceived = function(data){
    releaseExpressions();
    expressionControllers = [];
    for (var i = 0; i < data.expressions.length; i++) {
      var exp = sandbox.Expression.fromJSON(data.expressions[i]);
      var controller = new sandbox.ExpressionController(exp, ulNode);
      expressionControllers.push(controller);
      controller.onSelected = handleSelected;
      controller.attach();
    };
  };

  var releaseExpressions = function(){
    $(expressionControllers).each(function(i, controller){
      controller.detach();
    });
    expressionControllers = null;
  };

  // constructor
  this.attach = function(){
    $.getJSON('/expression.json', handleListReceived);
  };
};

window.addEventListener('load', function(){
  var application = new sandbox.Application(document.querySelector('#sandbox'));
});
