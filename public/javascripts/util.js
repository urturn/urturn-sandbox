sandbox.compile = function(html, context){
  return $(html.replace(/\$([a-zA-Z]+)/g, function(m){
    var k = m.substring(1);
    return (context[k] !== undefined ? context[k] : m);
  })).get(0);
};

sandbox.imageUrl = function(w, h) {
  if(window.navigator && !window.navigator.onLine){
    return 'http://' + window.location.host + '/local.jpg';
  } else {
    return 'http://placekitten.com/' + (w | 0) + '/' + (h | 0);
  }
};