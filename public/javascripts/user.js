(function(){
  "use strict";

  var usernames = ['john', 'marie', 'lisa', 'justin'];
  var users = {};
  var userCount = 0;

  sandbox.User = function(){
    this.uuid = null;
    this.username = null;
    this.avatar = null;
    this.usercard = null;
  };

  sandbox.User.find = function(id){
    if(!users[id]){
      sandbox.User.create({uuid: id});
    }
    return users[id];
  };

  sandbox.User.create = function(options){
    if(!options){
      options = {};
    }
    var u = new sandbox.User();
    u.usercard = Faker.Helpers.createCard();
    u.uuid = options.uuid || UT.uuid();

    if(options.username){
      u.username = options.username;
    } else {
      u.username = u.usercard.username;
    }
    u.avatar = sandbox.get_random_color();
    users[u.uuid] = u;
    userCount ++;

    return u;
  };
})();