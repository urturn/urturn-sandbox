sandbox.ExpressionListController = function(){
  var self = this;
  var expressionControllers = [];
  var template = "<ul class='unstyled expression-list'></ul>";
  var parentNode = null;
  var ulNode = null;
  var attached = false;

  var handleSelected = function(expression){
    if(self.onSelected){
      self.onSelected.call(self, expression);
    } else {
      console.log("onSelected not bound");
    }
  };

  // handle a list server response
  var handleListReceived = function(err, expressions){
    if(err){
      console.log(err);
      return;
    }
    releaseExpressions();
    expressionControllers = [];
    for (var i = 0; i < expressions.length; i++) {
      var controller = new sandbox.ExpressionController(expressions[i], ulNode);
      expressionControllers.push(controller);
      controller.onSelected = handleSelected;
      if(attached){
        controller.attach(ulNode);
      }
    }
  };

  var releaseExpressions = function(){
    $(expressionControllers).each(function(i, controller){
      controller.detach();
    });
    expressionControllers = null;
  };

  // attach the view to the given node.
  this.attach = function(node){
    parentNode = node;
    parentNode.innerHTML = template;
    ulNode = parentNode.childNodes[0];
    attached = true;
    for (var i = 0; i < expressionControllers.length; i++) {
      controller = expressionControllers[i];
      controller.onSelected = handleSelected;
      if(attached){
        controller.attach(ulNode);
      }
    }
  };

  // detach the view and release the controller.
  this.detach = function(){
    releaseExpressions();
    attached = false;
    parentNode.innerHTML = "";
  };

  sandbox.Expression.findAll(handleListReceived);
};