(function(){
  "use strict";

  var usernames = ['john', 'marie', 'lisa', 'justin'];
  var users = {};
  var userCount = 0;

  sandbox.User = function(){
    this.userId = null;
    this.username = null;
    this.avatar = null;
  };

  sandbox.User.find = function(id){
    if(!users[id]){
      sandbox.User.create({userId: id});
    }
    return users[id];
  };

  sandbox.User.create = function(options){
    if(!options){
      options = {};
    }
    var u = new sandbox.User();
    u.userId = options.userId || UT.uuid();

    if(options.username){
      u.username = options.username;
    } else {
      var round = parseInt(userCount / usernames.length, 10),
          index = userCount % usernames.length;
      u.username = usernames[index] + round;
    }
    u.avatar = sandbox.imageUrl(128 , 128);
    users[u.userId] = u;
    userCount ++;
    return u;
  };
})();