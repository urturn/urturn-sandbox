(function(){
  // Return helper behaviors to support list item
  sandbox.listControllerSupport = function(controller){
    // list of child item controllers
    var items = [];
    // defined if controller is currently attached
    var parentNode;

    var applyItems = function(fn){
      for(var i = 0; i < items.length; i++){
        fn(items[i]);
      }
    };

    var detachItems = function(){
      parentNode = undefined;
      applyItems(function(controller){
        controller.detach();
      });
    };

    var attachItems = function(node){
      parentNode = node;
      applyItems(function(controller){
        controller.attach(parentNode);
      });
    };

    var releaseItems = function(){
      detachItems();
      items = [];
    };

    var addItem = function(item){
      items.push(item);
      if(parentNode){
        controller.attach(parentNode);
      }
    };

    controller.releaseItems = releaseItems;
    controller.detachItems = detachItems;
    controller.attachItems = attachItems;
    controller.addItem = addItem;
    controller.applyItems = applyItems;
  };
})();