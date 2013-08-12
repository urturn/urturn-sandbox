(function(sandbox){
  "use strict";

  sandbox.openUserModal = function(title,users) {
    var usersObj = [];

    for(var i=0, l=users.length; i<l; i++) {
      usersObj.push(sandbox.User.find(users[i]));
    }
    jQuery.ajax({
      url: '../templates/modal.users.tpl',
      dataType: 'html',
      cache: false,
      success: function(data, status, response) {
        var template    = Handlebars.compile(response.responseText);
        var context = {
          people: usersObj,
          label: title
        };
        var html = template(context);

        $('body').append(html);
        $("#myModal").modal().on('hidden', function () { $(this).remove(); });
      }
    });
  };

}(sandbox));

Handlebars.registerHelper('list', function(items, options) {
  var out = "<ul class='users-list unstyled'>";
  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }

  return out + "</ul>";
});