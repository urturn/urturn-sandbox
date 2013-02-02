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