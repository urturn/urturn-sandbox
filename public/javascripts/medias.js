(function(sandbox){
  "use strict";

  var videosList = [
    'http://www.youtube.com/watch?v=Lnc2GU99O8s'
  ];

  var imagesList = [
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

  var audioList = [
    JSON.parse('{"_type":"sound","service":"soundcloud","url":"http://soundcloud.com/urturn/the-mission","title":"The Mission","artist":"urturn","cover":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25","artistCover":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25","soundCover":null,"waveFormImage":"http://w1.sndcdn.com/gHQkR7jhWdlh_m.png","link":"http://api.soundcloud.com/tracks/27816973","appData":{"kind":"track","id":27816973,"created_at":"2011/11/12 10:26:38 +0000","user_id":8871218,"duration":248597,"commentable":true,"state":"finished","original_content_size":9933964,"sharing":"public","tag_list":"","permalink":"the-mission","streamable":true,"embeddable_by":"all","downloadable":false,"purchase_url":null,"label_id":null,"purchase_title":null,"genre":"","title":"The Mission","description":"","label_name":"","release":"","track_type":null,"key_signature":null,"isrc":null,"video_url":null,"bpm":null,"release_year":null,"release_month":null,"release_day":null,"original_format":"mp3","license":"all-rights-reserved","uri":"http://api.soundcloud.com/tracks/27816973","user":{"id":8871218,"kind":"user","permalink":"urturn","username":"urturn","uri":"http://api.soundcloud.com/users/8871218","permalink_url":"http://soundcloud.com/urturn","avatar_url":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25"},"permalink_url":"http://soundcloud.com/urturn/the-mission","artwork_url":null,"waveform_url":"http://w1.sndcdn.com/gHQkR7jhWdlh_m.png","stream_url":"http://api.soundcloud.com/tracks/27816973/stream","playback_count":158,"download_count":0,"favoritings_count":1,"comment_count":1,"attachments_uri":"http://api.soundcloud.com/tracks/27816973/attachments"}}')
  ];

  // Generate a random number for widht or height of a picture
  sandbox.randSize = function() {
    return parseInt(300 + Math.random() * 500, 10);
  };

  sandbox.createImage = function(url,w,h,filename,callback) {
    var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    image = new Image(),
    bas64;

    image.onload = function() {
      canvas.width = w;
      canvas.height = h;
      context.drawImage(image, 0, 0, w, h );
      bas64 = canvas.toDataURL("image/png");
      callback(bas64);
    }

    image.crossOrigin = true;
    image.src = url;
  };

  sandbox.getImage = function(w, h,callback) {
    var imageRandom = imagesList[Math.floor(Math.random()*imagesList.length)],
    filename = w+"x"+h+"_"+imageRandom;

    sandbox.createImage("/sandboxImg/"+imageRandom,w,h,filename,function(data) {
      if (callback) {
        callback(data);
      }
    });
  };

  sandbox.getVideo = function(callback) {
    callback(videosList[Math.floor(Math.random()*videosList.length)]);
  };

  sandbox.getAudio = function(callback) {
    callback(audioList[Math.floor(Math.random()*audioList.length)]);
  };


}(sandbox));