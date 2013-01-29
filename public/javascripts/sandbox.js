window.addEventListener('load', function(){
  console.log('loaded');
  
  var iframe = document.querySelector('iframe');
  console.log(iframe);
  if(iframe.contentWindow){
    sendReadyEvent(iframe.contentWindow)
  } else {
    iframe.addEventListener('load', function(event){
      sendReadyEvent(iframe.contentWindow)
    }, false);
  }

  function sendReadyEvent(win){
    var k = iframe.contentWindow.UT.Expression;
    console.log(k);
    k._getInstance().trigger('ready', k._getInstance())
  }

}, false);