sandbox.ExpressionController = function(expression, ulNode){
  var self = this;
  var liNode;
  var itemTemplate = '<h4 class="expression-item-title">$title</h4><img src="expression/$bannerPath" /><div>$systemName-$version</div><div>$description</div>';
  var handleSelected = function(){
    if(self.onSelected){
      self.onSelected.call(self, expression)
    } else {
      console.log("onSelected not bound");
    }
  }
  this.attach = function(){
    liNode = document.createElement('li');
    liNode.innerHTML = sandbox.compile(itemTemplate, expression);
    ulNode.appendChild(liNode);
    liNode.addEventListener('click', handleSelected);
  };
  this.detach = function(){
    if(liNode){
      ulNode.removeChild(liNode);
    }
  }

  this.onSelected = null;
};
