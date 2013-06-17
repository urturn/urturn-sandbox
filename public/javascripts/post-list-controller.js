(function(){
  // Manage a list of post that can be edited or played.
  var PostListController = function(application){
    sandbox.listControllerSupport(this);

    var template = '<ul class="posts-list unstyled"></ul>';
    var parentNode;
    var titleNode;
    var templateNode;
    var attached = false;

    var handlePostsLoaded = function(err, posts){
      if(err){
        sandbox.log("Cannot load posts: ", err);
      } else {
        this.detachItems();
        for(var i = 0; i < posts.length; i++){
          var controller = new sandbox.PostListItemController(posts[i], application);
          this.addItem(controller);
        }
        if(templateNode){
          this.attachItems(templateNode);
        }
      }
    }.bind(this);

    this.attach = function(node){
      parentNode = node;
      templateNode = sandbox.compile(template);
      parentNode.appendChild(templateNode);
      this.attachItems(templateNode);
    };

    this.detach = function(){
      parentNode.removeChild(templateNode);
      templateNode = null;
      parentNode = null;
      this.detachItems();
    };

    sandbox.Post.findAll(handlePostsLoaded);
  };

  sandbox.PostListController = PostListController;
})();