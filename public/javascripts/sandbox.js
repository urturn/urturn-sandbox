window.addEventListener('load', function(){

  var controller = {
    newPost: function(event){
      var iframe = document.querySelector('iframe');
      if(iframe.contentWindow){
        sendReadyEvent(iframe.contentWindow)
      } else {
        iframe.addEventListener('load', function(event){
          sendReadyEvent(iframe.contentWindow)
        }, false);
      }
    }
  }

  // Trigger the ready event with data
  function sendReadyEvent(win){
    var k = win.UT.Expression;
    console.log(k);
    k._getInstance().trigger('ready', k._getInstance())
  }

  // Bind events
  bindings = document.querySelectorAll("*[data-action]");
  for(var i = 0; i < bindings.length; i++){
    bindings[i].addEventListener('click', controller[bindings[i].getAttribute('data-action')]);
  }

}, false);