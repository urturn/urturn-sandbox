sandbox.Post = function(){
  this.title = "";
  this.uuid = null;
  this.expression = null;
  this.collections = [
    {
      name: 'default',
      items: [],
      count: 0
    }
  ];
};