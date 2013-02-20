var sandbox = {};

window.addEventListener('load', function(){
  var application = new sandbox.Application(document.querySelector('#sandbox'));

  // Init code
  var currentUser = new sandbox.User.create();

  // ROUTES

  // Create a post
  application.addRoute('expression/:systemName/newpost', function(context){
    sandbox.Expression.findBySystemName(context.systemName, function(err, expression){
      if(err || !expression){
        console.log("Cannot find expression with system name: " + context.systemName);
        return;
      }
      var post = new sandbox.Post();
      post.expression = expression;
      sandbox.Post.save(post, function(err, post){
        if(err){
          console.log("Cannot save post");
          return;
        }
        application.navigate('post/' + post.uuid + '/edit');
      });
    });
  });

  // Edit an expression
  application.addRoute('post/:uuid/edit', function(context){
    sandbox.Post.load(context.uuid, function(err, post){
      if(err){
        console.log("Cannot display editor because of: " + err);
        return;
      }
      var postEditor = new sandbox.PostEditorController({
        currentUser: currentUser,
        post: post,
        application: application
      });
      console.log('ok guys');
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
      application.navigate('expression/' + expression.systemName + '/newpost');
    };
  });

  // Map application to template zone
  application.addZone('main', '#main');
  //application.addZone('sidebar', '#sidebar');

  // application.assignZone('main', expressionList);
  application.navigate(); // go to the current state if any.
});
