var sandbox = {};

window.addEventListener('load', function(){
  var application = new sandbox.Application(document.querySelector('#sandbox'));

  // Init code
  var currentUser = new sandbox.User.create();

  if(Math.random > 0.5){
    currentUser.numberOfPost = parseInt(Math.random * 1000, 10);
  } else {
    currentUser.numberOfPost = 0;
  }
  currentUser.numberOfUse = 0;

  // ROUTES

  // Create a post
  application.addRoute('expression/:systemName/newpost', function(context){
    sandbox.Expression.findBySystemName(context.systemName, function(err, expression){
      if(err || !expression){
        sandbox.log("Cannot find expression with system name: " + context.systemName);
        return;
      }
      var post = new sandbox.Post({
        expression: expression
      });
      sandbox.Post.save(post, function(err, post){
        if(err){
          sandbox.log("Cannot save post");
          return;
        }
        application.navigate('post/' + post.uuid + '/edit');
      });
    });
  });

  $(['play', 'edit']).each(function(i, mode){
    application.addRoute('post/:uuid/' + mode, function(context){
      application.oneColumn();
      sandbox.Post.load(context.uuid, function(err, post){
        if(err){
          sandbox.log("Cannot display " + mode + " because of: " + err);
          return;
        }
        var postEditor = new sandbox.PostEditorController({
          currentUser: currentUser,
          post: post,
          application: application,
          mode: mode
        });
        application.assignZone('main', postEditor);
        $(document).scrollTop(0);
      });
    });
  });

  // Back in history
  application.addRoute('back', function(context){
    window.history.go(-2);
  });

  // Homepage
  application.addRoute('', function(context){
    application.twoColumns();
    var expressionList = new sandbox.ExpressionListController();
    application.assignZone('main', expressionList);
    // bootstrap
    expressionList.onSelected = function(expression){
      application.navigate('expression/' + expression.systemName + '/newpost');
    };

    var postList = new sandbox.PostListController(application);
    application.assignZone('sidebar', postList);
  });

  // Map application to template zone
  application.addZone('main', '#main');
  application.addZone('sidebar', '#sidebar');

  application.twoColumns = function(){
    $('#sidebar').addClass('span3').removeClass('is-hidden');
    $('#main').show().addClass('span9').removeClass('span12');
    $('#deviceSelector').addClass('is-hidden');
  };

  application.oneColumn = function(){
    $('#sidebar').addClass('is-hidden').removeClass('span3');
    $('#main').show().removeClass('span9').addClass('span12');
    $('#deviceSelector').removeClass('is-hidden');
  };

  // application.assignZone('main', expressionList);
  application.navigate(); // go to the current state if any.

  // device selector
  if ('localStorage' in window && window['localStorage'] !== null && localStorage.device) {
    $('#main').addClass(localStorage.getItem("device"));
  }
});
