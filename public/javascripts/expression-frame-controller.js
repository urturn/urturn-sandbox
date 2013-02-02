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