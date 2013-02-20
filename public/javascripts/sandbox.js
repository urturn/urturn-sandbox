var sandbox = {};

window.addEventListener('load', function(){
  var application = new sandbox.Application(document.querySelector('#sandbox'));

  // Init code
  var currentUser = new sandbox.User.create();

  // ROUTES

  // Edit an expression
  application.addRoute('expression/:systemName/edit', function(context){
    sandbox.Expression.findBySystemName(context.systemName, function(err, expression){
      if(err){
        console.log("Cannot find expression with system name: " + context.systemName);
        return;
      }
      if(!expression){
        throw "expression not found with name " + context.systemName;
      }
      var postEditor = new sandbox.PostEditorController({
        currentUser: currentUser,
        expression: expression,
        application: application
      });
      application.assignZone('main', postEditor);
    });
  });

  // Back in history
  application.addRoute('back', function(context){
    window.history.go(-2);
  });

  // Homepage
  application.addRoute('', function(context){
    var expressionList = new sandbox.ExpressionListController();
    application.assignZone('main', expressionList);
    // bootstrap
    expressionList.onSelected = function(expression){
      console.log(expression);
      application.navigate('expression/' + expression.systemName + '/edit');
    };
  });

  // Map application to template zone
  application.addZone('main', '#main');
  //application.addZone('sidebar', '#sidebar');

  // application.assignZone('main', expressionList);
  application.navigate(); // go to the current state if any.
});
