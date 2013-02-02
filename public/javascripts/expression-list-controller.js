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