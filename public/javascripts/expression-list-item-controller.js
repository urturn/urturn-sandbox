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
      '<a href="#" class="banner thumbnail"><img src="$bannerPath" /></a>' +
      '<h3 class="expression-item-title">$title <small class="expression-item-idcard">$systemName-$version</small></h3>'+
      '<p class="description">$description</p>' +
      '</div></li>';

  var handleSelected = function(e){
    e.preventDefault();
    if(self.onSelected){
      self.onSelected.call(self, expression);
    } else {
      sandbox.log("onSelected not bound");
    }
  };
  this.attach = function(node){
    liNode = sandbox.compile(itemTemplate, expression);
    ulNode = node;
    ulNode.appendChild(liNode);
    liNode.getElementsByClassName('banner')[0].addEventListener('click', handleSelected);
  };
  this.detach = function(){
    if(liNode){
      ulNode.removeChild(liNode);
    }
    liNode = null;
  };

  this.onSelected = null;
};
