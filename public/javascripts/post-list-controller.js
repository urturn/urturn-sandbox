(function(){
  // Manage a list of post that can be edited or played.
  var PostListController = function(application){
    sandbox.listControllerSupport(this);

    var template = '<ul class="nav nav-tabs nav-stacked bs-docs-sidenav"><li class="nav-header">Posts</ul>';
    var parentNode;
    var titleNode;
    var ulNode;
    var attached = false;

    var handlePostsLoaded = function(err, posts){
      if(err){
        if(window.console && console.log) {
          console.log("Cannot load posts: ", err);
        }
      } else {
        this.detachItems();
        for(var i = 0; i < posts.length; i++){
          var controller = new sandbox.PostListItemController(posts[i], application);
          this.addItem(controller);
        }
        if(ulNode){
          this.attachItems(ulNode);
        }
      }
    }.bind(this);

    this.attach = function(node){
      parentNode = node;
      ulNode = sandbox.compile(template);
      parentNode.appendChild(ulNode);
      this.attachItems(ulNode);
    };

    this.detach = function(){
      parentNode.removeChild(ulNode);
      ulNode = null;
      parentNode = null;
      this.detachItems();
    };

    sandbox.Post.findAll(handlePostsLoaded);
  };

  sandbox.PostListController = PostListController;
})();