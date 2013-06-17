(function(){
  var PostListItemController = function(post, application){
    var self = this;
    var liNode;
    var editLink;
    var playLink;
    var itemTemplate = '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown" href="#">' +
          '<span class="state label label-$label">$state</span> '+
          '$expressionName' +
          '<time class="post-item-date">$date</time>' +
        '</a>' +
        '<ul class="dropdown-menu">' +
          '<li><a href="#" class="expression-item-edit">edit</a></li>' +
          '<li><a href="#" class="expression-item-play">play</a></li>' +
        '</ul>' +
      '</li>';

    var handleEdit = function(event){
      event.preventDefault();
      application.navigate('post/' + post.uuid + '/edit');
    };

    var handlePlay = function(event){
      event.preventDefault();
      application.navigate('post/' + post.uuid + '/play');
    };

    var handleSelected = function(){
      if(self.onSelected){
        self.onSelected.call(self, expression);
      } else {
        sandbox.log("onSelected not bound");
      }
    };

    this.attach = function(node){
      liNode = sandbox.compile(itemTemplate, {
        expressionName: post.expressionSystemName,
        uuid: post.uuid,
        date: prettyDate(post.createdAt.toJSON()),
        state: post.state,
        label: (post.state == 'draft' ? 'none' : 'success')
      });
      editLink = liNode.querySelector('.expression-item-edit');
      playLink = liNode.querySelector('.expression-item-play');
      editLink.onclick = handleEdit;
      playLink.onclick = handlePlay;
      ulNode = node;
      ulNode.appendChild(liNode);
    };
    this.detach = function(){
      if(liNode){
        ulNode.removeChild(liNode);
      }
      liNode = null;
    };

    this.onSelected = null;
  };

  sandbox.PostListItemController = PostListItemController;
})();