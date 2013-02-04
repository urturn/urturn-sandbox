sandbox.ExpressionEditorController = function(options){
  var node = options.node;
  var currentUser = options.currentUser;
  var expression = options.expression;

  var postButton = null;
  var expressionFrame = null;

  var template = "<div class='expression-editor'><iframe class='iframe iframe-expression expression-frame'></iframe><div><button class='post-button'>Post</post></div></div>";

  var handleOnPostStateChange = function(event){
    postButton.disabled = !event.newState;
  };

  // Create 
  this.attach = function(){
    node.innerHTML = template;
    postButton = node.querySelector('.post-button');
    iframe = node.querySelector('iframe');
    expressionFrame = new sandbox.ExpressionFrameController(iframe, currentUser);
    expressionFrame.onPostStateChange = handleOnPostStateChange;
    expressionFrame.attach();
    expressionFrame.load('/expression/' + expression.location + '/editor.html');
    postButton.disabled = true;
  };

  this.detach = function(){

  };
};