(function(){
  Post = function(data){
    data = data || {};
    this.title = data.title || "";
    this.state = data.state || "draft";
    this.uuid = data.uuid || UT.uuid();
    this.createdAt = (data.createdAt && new Date(data.createdAt)) || new Date();
    var lastRequestPromise;
    this.expressionSystemName = data.expressionSystemName || (data.expression && data.expression.systemName) || null;
    this.expression = data.expression || null;
    if(data.collections){
      this.collections = data.collections;
    } else {
      this.collections = buildCollections(this);
    }
    this.postUserId = data.postUserId;

    this.toJSON = function(){
      return JSON.stringify({
        title: this.title,
        uuid: this.uuid,
        expressionSystemName: this.expression && this.expression.systemName,
        collections: this.collections,
        createdAt: this.createdAt,
        state: this.state,
        postUserId: this.postUserId
      });
    };
  };

  function buildCollections(post){
    var collections = [{
      name: 'default',
      items: [],
      count: 0,
      public: false,
      prefetched: true
    }];
    if(post.expression && post.expression.collections){
      for (var i = 0; i < post.expression.collections.length; i++){
        var colDef = post.expression.collections[i];
        var col = {
          name: colDef.name,
          public: true,
          prefetched: true,
          definition: colDef,
          count: 0,
          operations: [],
          items: []
        };
        for (var j = 0; j < colDef.fields.length; j++) {
          var field = colDef.fields[j];
          if(field.operations){
            for(var opIdx in field.operations){
              col.operations.push({
                operation: field.operations[opIdx],
                field: field.name,
                sum: 0,
                average_count: 0,
                count: 0,
                average: -1
              });
            }
          }
        }
        collections.push(col);
      }
    }
    return collections;
  }

  // Persist a post on server.
  // Callback is passed (err, post) arguments.
  var save = function(post, callback){
    var opts = {
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
    };

    $.ajax({
      url: '/post/' + post.uuid + '.json?' + new Date().getTime(),
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
      url: '/post/' + uuid + '.json?' + new Date().getTime(),
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

  // load all posts
  var findAll = function(callback){
    $.ajax({
      url: '/post.json?' + new Date().getTime(),
      type: 'GET',
      success: function(data){
        var posts = [];
        for(var i = 0; i < data.posts.length; i++){
          posts.push(new Post(data.posts[i]));
        }
        callback(null, posts.sort(function(a,b){
          return (a.createdAt > b.createdAt ? -1 : 1);
        }));
      },
      error: function(){
        callback("Cannot load post, server error");
      }
    });
  };

  sandbox.Post = Post;
  sandbox.Post.load = load;
  sandbox.Post.save = save;
  sandbox.Post.findAll = findAll;
})();