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