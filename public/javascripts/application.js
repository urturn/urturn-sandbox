// Application handle the global sandbox lifecycle.
// rootNode must declare the following markup:
// - .iframe-expression class on an iframe tag
sandbox.Application = function(rootNode){
  var currentUser = new sandbox.User.create();
  var expressionList = new sandbox.ExpressionListController(rootNode.querySelector('.expression-list'));
  expressionList.attach();

  expressionList.onSelected = function(expression){
    var expressionEditor = new sandbox.ExpressionEditorController({
      node: rootNode.querySelector('.expression-editor'),
      currentUser: currentUser,
      expression: expression
    });
    expressionEditor.attach();
  };
};