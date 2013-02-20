// The expression controller take care of displaying an expression item.
// You can bind a function to instance.onSelected that will be called
// every time this expression is selected.
//
// See also sandbox.ExpressionListController
sandbox.ExpressionListItemController = function(expression){
  var self = this;
  var liNode;
  var ulNode;
  var itemTemplate = '<li><div class="box">' +
      '<img src="expression/$bannerPath" />' +
      '<h4 class="expression-item-title">$title</h4>'+
      '<div>$systemName-$version</div>'+
      '<div class="description">$description</div>' +
      '</div></li>';
  
  var handleSelected = function(){
    if(self.onSelected){
      self.onSelected.call(self, expression);
    } else {
      console.log("onSelected not bound");
    }
  };
  this.attach = function(node){
    liNode = sandbox.compile(itemTemplate, expression);
    ulNode = node;
    ulNode.appendChild(liNode);
    liNode.addEventListener('click', handleSelected);
  };
  this.detach = function(){
    if(liNode){
      ulNode.removeChild(liNode);
    }
    liNode = null;
  };

  this.onSelected = null;
};
