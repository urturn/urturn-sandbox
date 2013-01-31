window.addEventListener('load', function(){

  var controllerIframeBoundEvent = null;
  var iframe = document.querySelector('iframe');
  var post;

  var Post = function(){
    this.title = "";
  }

  var controller = {
    newPost: function(event){
      post = new Post();

      iframe.removeEventListener('load', controllerIframeBoundEvent, false);
      controllerIframeBoundEvent = function(event){
        sendReadyEvent(iframe.contentWindow)
      };
      iframe.addEventListener('load', controllerIframeBoundEvent, false);
      iframe.src = '/expression/editor.html';
    }
  }

  var fakeAPI = {
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

  // Trigger the ready event with data
  function sendReadyEvent(win){
    post = {
      uuid: UT.uuid(),
      collections: [
        {
          name: 'default',
          items: [],
          count: 0
        }
      ]
    };

    var user = {
      uuid: UT.uuid()
    };

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
        currentUserId: user.uuid,
        host: 'http://localhost:3333',
        assetPath: 'http://expressions',
        note : post.note,
        scrollValues: {} // XXX Need to be imported
      }
    };

    win.postMessage(JSON.stringify(readyMessage), '*');
  }

  // Bind events
  bindings = document.querySelectorAll("*[data-action]");
  for(var i = 0; i < bindings.length; i++){
    bindings[i].addEventListener('click', controller[bindings[i].getAttribute('data-action')]);
  }

  /**
   * post message handler
   */
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
    var func = fakeAPI;
    for(var i = 0; i < callPath.length; i++){
      func = func[callPath[i]];
    }
    func.apply(post, args);
    //_dispatch(msgObj);
  }, false);

}, false);