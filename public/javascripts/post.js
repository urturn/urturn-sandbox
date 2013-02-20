(function(){
  Post = function(data){
    data = data || {};
    this.title = data.title || "";
    this.uuid = data.uuid || UT.uuid();
    this.expressionSystemName = data.expressionSystemName || (data.expression && data.expression.systemName) || null;
    this.expression = data.expression || null;
    this.collections = data.collections || [
      {
        name: 'default',
        items: [],
        count: 0
      }
    ];
    this.toJSON = function(){
      return JSON.stringify({
        title: this.title,
        uuid: this.uuid,
        expressionSystemName: this.expression && this.expression.systemName,
        collections: this.collections
      });
    };
  };

  // Persist a post on server.
  // Callback is passed (err, post) arguments.
  var save = function(post, callback){
    $.ajax({
      url: '/post/' + post.uuid + '.json',
      type: 'POST',
      data: post.toJSON(),
      dataType: 'json',
      contentType: 'application/json',
      parseData: false,
      success: function(data){
        if(callback){
          callback(null, post);
        }
      },
      error: function(error){
        if(callback){
          callback('Cannot save post, server error.');
        }
      }
    });
  };

  // load and a rebuild a post from persisted data using its uuid
  var load = function(uuid, callback){
    $.ajax({
      url: '/post/' + uuid + '.json',
      type: 'GET',
      success: function(data){
        var post = new Post(data);
        if(post.expressionSystemName){
          sandbox.Expression.findBySystemName(post.expressionSystemName, function(err, expression){
            post.expression = expression;
            callback(err, post);
          });
        } else {
          callback('No expression system name defined');
        }
      },
      error: function(){
        callback("Cannot load post, server error");
      }
    });
  };

  sandbox.Post = Post;
  sandbox.Post.load = load;
  sandbox.Post.save = save;
})();