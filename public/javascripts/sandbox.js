var sandbox = {};

// Application handle the global sandbox lifecycle.
// rootNode must declare the following markup:
// - .iframe-expression class on an iframe tag
sandbox.Application = function(rootNode){
  var expressionFrame = new sandbox.ExpressionFrameController(rootNode.querySelector('.expression-frame'));
  var expressionList = new sandbox.ExpressionListController(rootNode.querySelector('.expression-list'));

  expressionList.attach();
};

sandbox.ExpressionFrameController = function(iframeNode){
};

// Expression Model constructor
sandbox.Expression = function(pObject){
  this.systemName = null;
  this.version = null;
  this.title = null;
  this.description = null;
  this.location = null;
};

// Instantiate an expression from JSON data
sandbox.Expression.fromJSON = function(pObject){
  var expression = new sandbox.Expression();
  expression.title = pObject.title;
  expression.description = pObject.description;
  expression.version = pObject.version;
  expression.systemName = pObject.systemName;
  expression.location = pObject.location;
  expression.bannerPath = pObject.bannerPath;
  return expression;
};

sandbox.compile = function(html, context){
  return html.replace(/\$([a-zA-Z]+)/g, function(m){
    var k = m.substring(1)
    console.log(k)
    return (context[k] !== undefined ? context[k] : m);
  });
}

sandbox.ExpressionController = function(expression, ulNode){
  var liNode;
  var itemTemplate = '<h4 class="expression-item-title">$title</h4><img src="expression/$bannerPath" /><div>$systemName-$version</div><div>$description</div>';
  this.attach = function(){
    liNode = document.createElement('li');
    liNode.innerHTML = sandbox.compile(itemTemplate, expression);
    ulNode.appendChild(liNode);
  }
  this.detach = function(){
    if(liNode){
      ulNode.removeChild(liNode);
    }
  }
};

sandbox.ExpressionListController = function(ulNode){
  var expressionControllers = [];

  // handle a list server response
  var handleListReceived = function(data){
    releaseExpressions();
    expressionControllers = [];
    for (var i = 0; i < data.expressions.length; i++) {
      console.log(data.expressions);
      var exp = sandbox.Expression.fromJSON(data.expressions[i]);
      var controller = new sandbox.ExpressionController(exp, ulNode);
      expressionControllers.push(controller);
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

window.addEventListener('load', function(){
  var application = new sandbox.Application(document.querySelector('#sandbox'));
});
