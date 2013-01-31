window.addEventListener('load', function(){

  var controller = {
    newPost: function(event){
      var iframe = document.querySelector('iframe');
      iframe.src = '/expression/editor.html'
      iframe.addEventListener('load', function(event){
        sendReadyEvent(iframe.contentWindow)
      }, false);
    }
  }

  // Trigger the ready event with data
  function sendReadyEvent(win){
    var post = {
      uuid: UT.uuid(),
      collections: {
        default: {}
      }
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

    win.postMessage(JSON.stringify(readyMessage));
  }

  // Bind events
  bindings = document.querySelectorAll("*[data-action]");
  for(var i = 0; i < bindings.length; i++){
    bindings[i].addEventListener('click', controller[bindings[i].getAttribute('data-action')]);
  }

}, false);