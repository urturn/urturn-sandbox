(function(sandbox){
  "use strict";

  sandbox.notify = function(type,msg) {
    var notifDomNode = jQuery('.notifications-area');

    var notif = jQuery('<div />')
      .addClass(type)
      .html(msg)
      .appendTo(notifDomNode);

    var close = jQuery('<a class="close" data-dismiss="alert" href="#">&times;</a>').appendTo(notif);

    notifDomNode.show();

    notif
      .alert()
      .on('closed', function () {
        notifDomNode.empty().hide();
    });
  };


}(sandbox));