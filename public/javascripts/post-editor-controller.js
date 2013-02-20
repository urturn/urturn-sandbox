sandbox.PostEditorController = function(options){
  var template = "<div class='post-editor'><h2 class='expression-title'>$title</h2>" +
    "<h3 class='post-title'>$postTitle</h3>" +
    "<iframe class='iframe iframe-expression expression-frame'></iframe>" +
    "<div><button class='btn btn-disabled post-button'>Post</button> <button class='btn btn-danger quit-button'>Quit</button></div>" +
    "<p><b>Post note:</b> <span id='postNote'></span></p></div>";
  
  if(!options.currentUser){
    throw 'Missing currentUser option';
  }
  if(!options.expression){
    throw 'Missing expression option';
  }

  var currentUser = options.currentUser;
  var expression = options.expression;
  var application = options.application;
  var post;
  var storeDelegate = {}; // storeDelegate functions will be declared later

  // Create Model
  if(options.post){
    post = options.post;
  } else {
    post = new sandbox.Post();
  }
  post.uuid = UT.uuid();
  post.expression = expression;
  var store = new UT.CollectionStore({
    data: post.collections,
    currentUserId: currentUser.uuid,
    delegate: storeDelegate
  });

  // Init view mapping variables;
  var container,
      postButton,
      quitButton,
      postTitle,
      expressionFrame ;

  // Save the current document.
  var savePost = function(post){
    $.ajax({
      url: '/post/' + post.uuid + '.json',
      type: 'POST',
      data: JSON.stringify(post),
      dataType: 'application/json',
      contentType: 'application/json',
      parseData: false
    });
  };

  // Implements colleciton store delegate methods
  storeDelegate.save = function(name, itemsToSave){
    post.collections = store.getCurrentData();
    savePost(post);
  };

  // Nice API
  var api = {
    container: {
      setTitle: function(title, callbackNotUsed){
        post.title = title;
        postTitle.innerHTML = title;
      },
      resizeHeight: function(value, callback){
        expressionFrame.height = parseInt(value, 10);
      }
    },
    collections: {
      save: function(name, objectsByKey, callbackNotUsed){
        var collection = store.get(name);
        for(var k in objectsByKey){
          collection.setItem(k, objectsByKey[k]);
        }
        collection.save(function(){
          console.log('collection saved' + arguments);
        });
      }
    },
    medias: {

      _createCenterFromImgSize : function(w, h) {
        return {
          DEST_W: w,
          DEST_H: h,
          SOURCE_X:0,
          SOURCE_Y: 0,
          SOURCE_W: w,
          SOURCE_H: h
        }
      },

      _getImage : function(w, h) {
        return 'http://localhost:3333/image_proxy/lorempixel.com/' + (w | 0) + '/' + (h | 0);
      },
      openImageChooser : function(options, callback) {
        if (options.size && options.size.width && options.size.height){
          callback({_center : api.medias._createCenterFromImgSize(options.size.width, options.size.height) ,type : '_image', url : api.medias._getImage(options.size.width ,options.size.height), info : {source : 'loremPix'}});
        }
        else {
         callback({_center : api.medias._createCenterFromImgSize(576,600) ,type : '_image', url : api.medias._getImage(576 , 600), info : {source : 'loremPix'}});
        }
      },

      crop : function(options, callback) {
        if (options.size && options.size.width && options.size.height) {
           callback({_center : api.medias._createCenterFromImgSize((options.size.width | 0), (options.size.height  |0)),type : '_image', url : api.medias._getImage(options.size.width ,options.size.height), info : {source : 'loremPix'}});
        }
        else {
            callback({_center : api.medias._createCenterFromImgSize(576,600), type : '_image', url : api.medias._getImage(576 , 600), info : {source : 'loremPix'}});
        }
      },

      reCrop : function(options, callback) {
        if (options.size && options.size.width && options.size.height) {
           callback({_center : api.medias._createCenterFromImgSize((options.size.width | 0), (options.size.height  |0)),type : '_image', url : api.medias._getImage(options.size.width ,options.size.height), info : {source : 'loremPix'}});
        }
        else {
            callback({_center : api.medias._createCenterFromImgSize(576,600),type : '_image', url : api.medias._getImage(576 , 600), info : {source : 'loremPix'}});
        }
      },

      createImage: function(image, callback){
        if (typeof(image) === 'string') {
          image = { _type : "image", url : image};
        }
        if (!image._type){
          image._type = 'image';
        }
        callback(image);
      },
      applyFilterToImage: function(options, callback)
      {
        console.log('Filter Applied : ', options.filter);
        callback(options.image);
      },
      imageWithDataUrl : function(dataUrl, callback) {
        api.medias.createImage(dataUrl, callback);
      },
      openSoundChooser: function(options, callback) {
        var media = JSON.parse('{"_type":"sound","service":"soundcloud","url":"http://soundcloud.com/urturn/the-mission","title":"The Mission","artist":"urturn","cover":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25","artistCover":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25","soundCover":null,"waveFormImage":"http://w1.sndcdn.com/gHQkR7jhWdlh_m.png","link":"http://api.soundcloud.com/tracks/27816973","appData":{"kind":"track","id":27816973,"created_at":"2011/11/12 10:26:38 +0000","user_id":8871218,"duration":248597,"commentable":true,"state":"finished","original_content_size":9933964,"sharing":"public","tag_list":"","permalink":"the-mission","streamable":true,"embeddable_by":"all","downloadable":false,"purchase_url":null,"label_id":null,"purchase_title":null,"genre":"","title":"The Mission","description":"","label_name":"","release":"","track_type":null,"key_signature":null,"isrc":null,"video_url":null,"bpm":null,"release_year":null,"release_month":null,"release_day":null,"original_format":"mp3","license":"all-rights-reserved","uri":"http://api.soundcloud.com/tracks/27816973","user":{"id":8871218,"kind":"user","permalink":"urturn","username":"urturn","uri":"http://api.soundcloud.com/users/8871218","permalink_url":"http://soundcloud.com/urturn","avatar_url":"http://a1.sndcdn.com/images/default_avatar_large.png?6c55c25"},"permalink_url":"http://soundcloud.com/urturn/the-mission","artwork_url":null,"waveform_url":"http://w1.sndcdn.com/gHQkR7jhWdlh_m.png","stream_url":"http://api.soundcloud.com/tracks/27816973/stream","playback_count":158,"download_count":0,"favoritings_count":1,"comment_count":1,"attachments_uri":"http://api.soundcloud.com/tracks/27816973/attachments"}}');
        callback(media);
      },
      openVideoChooser : function(options, callback) {
        callback({url:'http://www.youtube.com/watch?v=Lnc2GU99O8s'});
      },
      findImage: function(options, callback) {
        callback({type : '_image', url : 'http://lorempixel.com/576/600', info : {source : 'loremPix'}});
      }
    },
    url: {

    },
    document: {
      readyToPost: function(value){
        console.log('readyToPost : ', value);
        postButton.disabled = !value;
      },
      __note : 'test',
      setNote: function(note) {
        document.getElementById('postNote').innerHTML = note;
      }
    },
    sendReadyMessage: function(post){
      var readyMessage = {
        type: 'ready',
        // This will become the _states properties
        // XXX This should be named initialState
        // XXX wow, need to do something with this messy code.
        options: {
          expToken: UT.uuid(),
          mode: 'editor',
          documentURL: '/posts/' + post.uuid,
          documentId: post.uuid,
          documentPrivacy: 'public',
          collections: post.collections,
          currentUserId: currentUser.uuid,
          host: 'localhost:3333',
          assetPath: 'http://expressions',
          note : post.note,
          scrollValues: {} // XXX Need to be imported
        }
      };
      expressionFrame.contentWindow.postMessage(JSON.stringify(readyMessage), "*");
    }
  };

  // Load the iframe content with the editor.
  var load = function(src, callback){
    async.parallel([
      // Wait for iframe
      function(cb){
        var waitLoaded = function(event, callback){
          expressionFrame.removeEventListener('load', waitLoaded, false);
          expressionFrame.height = 500;
          cb(null, true);
        };
        expressionFrame.addEventListener('load', waitLoaded, false);
      },
      // Create a post
      function(cb){
        cb(null, post);
      }
    ], function(err, results){
      console.log('loaded', err, results);
      api.sendReadyMessage(results[1]);
    });

    expressionFrame.src = src;
  };

  var handleIframeMessage = function(event){
    var data = JSON.parse(event.data);
    var callPath = data.methodName.split('.');
    var args = data.args || [];
    var func = api;
    for(var i = 0; func && i < callPath.length; i++){
      func = func[callPath[i]];
    }
    if(!func){
      console.log("method '" + data.methodName + "' not implemented. No callback will be fired.");
      console.log("ignored call for " + data.methodName + "(" + args.join(', ') + ")");
    } else {
      args.push(function(response){
        var data = JSON.parse(event.data);
        if (data.callbackId) {
          var res = {};
          res.result = [response];
          res.callbackId = data.callbackId;
          res.type = 'callback';
          response = res;
        }
        expressionFrame.contentWindow.postMessage(JSON.stringify(response), '*');
      });
      func.apply(post, args);
    }
  };

  this.attach = function(node){
    // Attach DOM
    node.innerHTML = sandbox.compile(template, {title: expression.title, postTitle: 'Untitled post'});
    container = node.querySelector('.post-editor');
    postButton = node.querySelector('.post-button');
    quitButton = node.querySelector('.quit-button');
    expressionFrame = node.querySelector('iframe');
    postTitle = node.querySelector('.post-title');
    postButton.disabled = true;
    quitButton.addEventListener('click', function(event){
      application.navigate('');
    }, false);
    load('/expression/' + expression.location + '/editor.html');
    window.addEventListener("message", handleIframeMessage, false);
  };

  this.detach = function(node){
    expressionFrame = null;
    window.removeEventListener("message", handleIframeMessage, false);
    node.innerHTML = "";
  };
};