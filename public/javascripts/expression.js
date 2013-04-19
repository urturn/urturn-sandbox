(function(){ // defining a local scope

  var expressionStore = [];

  // Expression Model constructor
  var Expression = function(pObject){
    this.systemName = null;
    this.version = null;
    this.title = null;
    this.description = null;
    this.location = null;
    this.collections = [];
  };

  // Instantiate an expression from JSON data
  var fromJSON = function(pObject){
    var expression = new Expression();
    expression.systemName = pObject.systemName;
    expression.title = pObject.title || pObject.systemName;
    expression.description = pObject.description;
    expression.version = pObject.version;
    expression.location = pObject.location;
    expression.bannerPath = pObject.bannerPath;
    expression.collections = pObject.collections;

    if(!expression.bannerPath){
      expression.bannerPath = sandbox.imageUrl(800, 408);
    } else {
      expression.bannerPath = '/expression/' + expression.bannerPath;
    }

    return expression;
  };

  var findAll = function(callback){
    if(expressionStore.length === 0){
      $.getJSON('/expression.json', function(data){
        expressionStore = [];
        for(var i in data.expressions){
          expressionStore.push(fromJSON(data.expressions[i]));
        }
        callback(null, expressionStore);
      }, function(xhr, err){
        callback("Cannot retrieve the list of expressions");
      });
    } else {
      // XXX should copy this array obviously.
      callback(null, expressionStore);
    }
    return true;
  };

  var findBySystemName = function(systemName, callback){
    findAll(function(err, expressions){
      if(err){
        callback(err);
      } else {
        for(var i in expressions){
          if(expressions[i].systemName == systemName){
            callback(null, expressions[i]);
            return;
          }
        }
        callback(null, null);
      }
    });
  };

  Expression.fromJSON = fromJSON;
  Expression.findAll = findAll;
  Expression.findBySystemName = findBySystemName;
  sandbox.Expression = Expression;
})();