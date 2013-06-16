(function(sandbox){
  "use strict";

  var IMAGES = [
    'bromo.jpg',
    'cloud.jpg',
    'color.jpg',
    'cube.jpg',
    'deep.jpg',
    'delasoul.jpg',
    'hidden.jpg',
    'horse.jpg',
    'insect.jpg',
    'interior.jpg',
    'istanbul.jpg',
    'keyboard.jpg',
    'masarwa.jpg',
    'megabass.jpg',
    'mic.jpg',
    'museum.jpg',
    'odaray.jpg',
    'office.jpg',
    'paint.jpg',
    'panda.jpg',
    'savoye.jpg',
    'slurp.jpg',
    'suit.jpg',
    'tattoo.jpg',
    'titulo.jpg',
    'yellow.jpg'
  ];

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
    return "/sandboxImg/"+IMAGES[(h)%IMAGES.length];
    /*if(window.navigator && !window.navigator.onLine){
      return 'http://' + window.location.host + '/local.jpg';
    } else {
      return sandbox.imageServiceURL + '/' + (w || sandbox.randSize() ) + '/' + (h || sandbox.randSize() );
    }*/
  };
}(sandbox));