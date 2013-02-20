// Take care of displaying and managing a list of ExpressionListItemController.
// You can set instance.onSelected to a function that will be called
// every time an expression from the list is selected. The callback
// will receive the expression as first parameter.
sandbox.ExpressionListController = function(){
  var expressionControllers = [];
  var template = "<ul class='expression-list'></ul>";
  var parentNode = null;
  var ulNode = null;

  sandbox.listControllerSupport(this);


  var handleSelected = function(expression){
    if(this.onSelected){
      this.onSelected.call(this, expression);
    } else {
      console.log("onSelected not bound");
    }
  }.bind(this);

  // handle a list server response
  var handleListReceived = function(err, expressions){
    if(err){
      console.log(err);
      return;
    }
    this.detachItems();
    for (var i = 0; i < expressions.length; i++) {
      var controller = new sandbox.ExpressionListItemController(expressions[i], ulNode);
      this.addItem(controller);
      controller.onSelected = handleSelected;
    }
    if(ulNode){
      this.attachItems(ulNode);
    }
  }.bind(this);

  // attach the view to the given node.
  this.attach = function(node){
    parentNode = node;
    parentNode.innerHTML = template;
    ulNode = parentNode.childNodes[0];
    this.attachItems(ulNode);
    this.applyItems(function(item){
      item.onSelected = handleSelected;
    });
  };

  // detach the view and release the controller.
  this.detach = function(){
    this.detachItems();
    parentNode.removeChild(ulNode);
    ulNode = null;
    this.applyItems(function(item){
      item.onSelected = null;
    });
  }.bind(this);

  sandbox.Expression.findAll(handleListReceived);
};