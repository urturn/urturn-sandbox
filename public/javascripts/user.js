sandbox.User = function(){
  this.uuid = null;
}

sandbox.User.create = function(){
  var u = new sandbox.User();
  u.uuid = UT.uuid();
  return u;
}