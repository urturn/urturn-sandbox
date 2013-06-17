(function(){
  var PostListItemController = function(post, application){
    var self = this;
    var liNode;
    var editLink;
    var playLink;
    var itemTemplate = '<li>' +
          '<span class="btn-group pull-right">' +
            '<a href="#" class="expression-item-edit btn btn-mini" title="Edit"><i class="icon-pencil"></i></a>' +
            '<a href="#" class="expression-item-play btn btn-mini" title="Play"><i class="icon-play"></i></a>' +
          '</span>' +
          '<span class="state label label-$label">$state</span> '+
          '$expressionName' +
          '<time class="post-item-date">$date</time>' +
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
        label: (post.state == 'draft' ? 'warning' : 'success')
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