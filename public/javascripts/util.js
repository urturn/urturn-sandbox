sandbox.compile = function(html, context){
  return $(html.replace(/\$([a-zA-Z]+)/g, function(m){
    var k = m.substring(1);
    return (context[k] !== undefined ? context[k] : m);
  })).get(0);
};

// the url used to retrieve random images
sandbox.imageServiceURL = '/placekitten.com';

// Generate a random number for widht or height of a picture
sandbox.randSize = function() {
  return parseInt(300 + Math.random() * 500, 10);
};

sandbox.imageUrl = function(w, h) {
  return "/sandboxImg/"+['boat.jpg','building.jpg','car.jpg','church.jpg','dog.jpg','fireworks.jpg','gecko.jpg','landscape.jpg','market.jpg','moon.jpg','sign.jpg'][(w*h)%11];
  /*if(window.navigator && !window.navigator.onLine){
    return 'http://' + window.location.host + '/local.jpg';
  } else {
    return sandbox.imageServiceURL + '/' + (w || sandbox.randSize() ) + '/' + (h || sandbox.randSize() );
  }*/
};