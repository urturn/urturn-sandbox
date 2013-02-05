sandbox.PostEditorController = function(options){
  var template = "<div class='post-editor'><h2 class='expression-title'>$title</h2><h3 class='post-title'>$postTitle</h3><iframe class='iframe iframe-expression expression-frame'></iframe><div><button class='post-button'>Post</post></div></div>";
  
  if(!options.currentUser){
    throw 'Missing currentUser option';
  }
  if(!options.expression){
    throw 'Missing expression option';
  }

  var currentUser = options.currentUser;
  var expression = options.expression;
  var post;
  var storeDelegate = {}; // storeDelegate functions will be declared later

  // Create Model
  if(options.post){
    post = options.post;
  } else {
    post = new sandbox.Post();
  }
  post.uuid = UT.uuid();
  post.expression = expression;
  var store = new UT.CollectionStore({
    data: post.collections,
    currentUserId: currentUser.uuid,
    delegate: storeDelegate
  });

  // Init view mapping variables;
  var container, postButton, postTitle, expressionFrame ;

  // Save the current document.
  var savePost = function(post){
    $.ajax({
      url: '/post/' + post.uuid + '.json',
      type: 'POST',
      data: JSON.stringify(post),
      dataType: 'application/json',
      contentType: 'application/json',
      parseData: false
    });
  };

  // Implements colleciton store delegate methods
  storeDelegate.save = function(name, itemsToSave){
    post.collections = store.getCurrentData();
    savePost(post);
  };

  // Nice API
  var api = {
    container: {
      setTitle: function(title, callbackNotUsed){
        post.title = title;
        postTitle.innerHTML = title;
      }
    },
    collections: {
      save: function(name, objectsByKey, callbackNotUsed){
        var collection = store.get(name);
        for(var k in objectsByKey){
          collection.setItem(k, objectsByKey[k]);
        }
        collection.save(function(){
          console.log('collection saved' + arguments);
        });
      }
    },
    document: {
      readyToPost: function(value){
        postButton.disabled = !value;
      }
    },
    sendReadyMessage: function(post){
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
      expressionFrame.contentWindow.postMessage(JSON.stringify(readyMessage), "*");
    }
  };

  // Load the iframe content with the editor.
  var load = function(src, callback){
    async.parallel([
      // Wait for iframe
      function(cb){
        var waitLoaded = function(event, callback){
          expressionFrame.removeEventListener('load', waitLoaded, false);
          expressionFrame.height = 500;
          cb(null, true);
        };
        expressionFrame.addEventListener('load', waitLoaded, false);
      },
      // Create a post
      function(cb){
        cb(null, post);
      }
    ], function(err, results){
      console.log('loaded', err, results);
      api.sendReadyMessage(results[1]);
    });

    expressionFrame.src = src;
  };

  var handleIframeMessage = function(event){
    var data = JSON.parse(event.data);
    var callPath = data.methodName.split('.');
    var args = data.args || [];
    var func = api;
    for(var i = 0; i < callPath.length; i++){
      if(!func){
        console.log("method '" + data.methodName + "' not implemented. No callback will be fired.");
        console.log("ignored call for " + data.methodName + "(" + args.join(', ') + ")");
      } else {
        func = func[callPath[i]];
      }
    }
    if(func){
      args.push(function(response){
        expressionFrame.contentWindow.postMessage(JSON.stringify(response));
      });
      func.apply(post, args);
    }
  };

  this.attach = function(node){
    // Attach DOM
    node.innerHTML = sandbox.compile(template, {title: expression.title, postTitle: 'Untitled post'});
    container = node.querySelector('.post-editor');
    postButton = node.querySelector('.post-button');
    expressionFrame = node.querySelector('iframe');
    postTitle = node.querySelector('.post-title');
    postButton.disabled = true;
    load('/expression/' + expression.location + '/editor.html');
    window.addEventListener("message", handleIframeMessage, false);
  };

  this.detach = function(node){
    window.removeEventListener("message", handleIframeMessage, false);
    node.innerHTML = "";
  };
};