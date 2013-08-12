<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="myModalLabel">{{ label }}</h3>
  </div>
  <div class="modal-body">
    <p>{{#list people}}{{usercard.name}} ({{username}}) {{/list}}</p>
  </div>
</div>