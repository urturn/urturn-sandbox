sandbox.PostEditorController = function(options){
  var templates = {
    edit: "<div class='post-editor'><h2 class='expression-title'>$title</h2>" +
          "<div class='expression-bounding-box'><iframe class='iframe iframe-expression expression-frame'></iframe></div>" +
          "<div class='expression-footer'><button class='btn btn-danger quit-button'>Quit</button> <button class='btn btn-disabled post-button'>Post</button></div>" +
          "<p><b>Post note:</b> <span id='postNote'></span></p></div>",
    play: "<div class='post-editor'><h2 class='expression-title'>$title</h2>" +
          "<div class='expression-bounding-box'><iframe class='iframe iframe-expression expression-frame'></iframe></div>" +
          "<div class='expression-footer'><button class='btn btn-danger quit-button'>Quit</button></div>" +
          "<p><b>Post note:</b> <span id='postNote'></span></p></div>"
  };

  if(!options.currentUser){
    throw 'Missing currentUser option';
  }

  var currentUser = options.currentUser;
  var application = options.application;
  var post = options.post;
  var expression = post.expression;
  var storeDelegate = {}; // storeDelegate functions will be declared later
  var fixedHeight = false; // Will become true after a call to the resize method
  var store = new UT.CollectionStore({
    data: post.collections,
    currentUserId: currentUser.uuid,
    delegate: storeDelegate
  });
  var navigationStates = [];
  var mode = options.mode;

  // Init view mapping variables;
  var container,
      postButton,
      quitButton,
      postTitle,
      expressionFrame,
      boundingBox ;

  // Save the current document.
  var savePost = function(post){
    sandbox.Post.save(post);
  };

  // Implements colleciton store delegate methods
  storeDelegate.save = function(name, itemsToSave){
    post.collections = store.getCurrentData();
    savePost(post);
  };

  // Retrieve the scrollPosition of the iframe
  // they are the portion of the iframe visile on screen
  var getIframeScrollPosition = function(){
    var $frame = $(expressionFrame);
    if(!$frame){
      return {scrollTop: 0, scrollBottom: 0};
    }
    var $w = $(window),
        frameOffset = $frame.offset(),
        winScrollTop = $w.scrollTop(),
        winHeight = $w.height(),
        marginFromWinTop = (frameOffset ? frameOffset.top : 0),
        frameBorderWidth = parseInt($frame.css("border-top-width"), 10),
        frameHeight = $frame.height();

    var scrollTop =  winScrollTop - marginFromWinTop - frameBorderWidth;
    if(scrollTop < 0){
      scrollTop = 0;
    }

    var scrollBottom = ( marginFromWinTop + frameHeight + frameBorderWidth ) - ( winScrollTop + winHeight );
    if ( scrollBottom < 0 ) {
      scrollBottom = 0;
    }
    return {
      scrollTop: scrollTop,
      scrollBottom: scrollBottom,
      wScrollTop: winScrollTop,
      wHeight: winHeight,
      borderWidth: frameBorderWidth,
      height: frameHeight,
      offsetTop: marginFromWinTop + frameBorderWidth
    };
  };

  // Nice API
  var api = {
    dialog: {
      users: function(options, callback){
        console.log('Simulating display of a user list containing those user ids:', options.users);
        alert('An user list will be displayed here (more details in logs).');
        callback();
      },
      suggestRotation : function(options, callback) {
        alert('You should rotate!');
        callback();
      }
    },
    container: {
      enableRotation: function(flag, callback) {
        console.log('Rotation enable -> ', flag);
        callback();
      },
      resizeHeight: function(value, callback){
        var height = parseInt(value, 10);
        var $frame = $(expressionFrame);
        $frame.height(height);
        fixedHeight = true;
        callback({height: height, width: $frame.width()});
        handleWindowScroll();
      },
      scroll: function(position, anchor, callback){
        var pos = getIframeScrollPosition();
        var scrollTop;
        if(anchor === 'top'){
          scrollTop = pos.offsetTop + parseInt(position, 10);
          $(window).scrollTop(scrollTop);
        } else {
          scrollTop = pos.offsetTop + pos.height - pos.wHeight - position;
          $(window).scrollTop(scrollTop);
        }
        var scrollValues = getIframeScrollPosition();
        callback(scrollValues);
        api.sendEvent('scrollChanged', [scrollValues]);
      },
      pushNavigation: function(action, callback){
        var availableNames = ['cancel', 'back', 'quit'];
        if(availableNames.indexOf(action) === -1){
          sandbox.log("Unknown action:" + action, "not in", availableNames);
          callback(); // cancel the user state immediatly
        } else {
          navigationStates.push({callback: callback, name: action});
          quitButton.innerHTML = action;
        }
      },
      popNavigation: function(){
        if(navigationStates.length > 0){
          var result = navigationStates.pop();
          if(navigationStates.length > 0){
            quitButton.innerHTML = navigationStates[navigationStates.length-1].name;
          } else {
            quitButton.innerHTML = 'Quit';
          }
          return result;
        }
      }
    },
    collections: {
      save: function(name, objectsByKey, callbackNotUsed){
        var collection = store.get(name);
        if(!collection){
          sandbox.log('missing collection ' + name);
          return;
        }
        for(var k in objectsByKey){
          if(collection.isPublic()){
            collection.setUserItem(objectsByKey[k]);
          } else {
            collection.setItem(k, objectsByKey[k]);
          }
        }
        collection.save(function(){
          sandbox.log('collection saved' + arguments);
        });
      },
      find: function(name, options, callback){
        var collection = store.get(name);
        callback(collection.getCurrentData().items);
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
        };
      },
      openImageChooser : function(options, callback) {
        if (!options.size){
          options.size = {};
        }
        if (!options.size.width){
          options.size.width = sandbox.randSize();
        }
        if (!options.size.height){
          options.size.height = sandbox.randSize();
        }
        callback({_center : api.medias._createCenterFromImgSize(options.size.width, options.size.height) ,type : '_image', url : sandbox.imageUrl(options.size.width ,options.size.height), info : {source : 'loremPix'}});
      },

      crop : function(options, callback) {
        if (options.size && options.size.width && options.size.height) {
          callback({_center : api.medias._createCenterFromImgSize((options.size.width | 0), (options.size.height  |0)),type : '_image', url : sandbox.imageUrl(options.size.width ,options.size.height), info : {source : 'loremPix'}});
        }
        else {
          callback({_center : api.medias._createCenterFromImgSize(sandbox.randSize(), sandbox.randSize()), type : '_image', url : sandbox.imageUrl(width, height), info : {source : 'loremPix'}});
        }
      },

      reCrop : function(options, callback) {
        if (options.size && options.size.width && options.size.height) {
           callback({_center : api.medias._createCenterFromImgSize((options.size.width | 0), (options.size.height  |0)),type : '_image', url : sandbox.imageUrl(options.size.width ,options.size.height), info : {source : 'loremPix'}});
        }
        else {
          callback({_center : api.medias._createCenterFromImgSize(sandbox.randSize(),sandbox.randSize()),type : '_image', url : sandbox.imageUrl(sandbox.randSize() , sandbox.randSize()), info : {source : 'loremPix'}});
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
        sandbox.log('Filter Applied : ', options.filter);
        callback(options.image);
      },
      applyFilter: function(options, callback)
      {
        sandbox.log('Filter Applied : ', options.filter);
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
        callback({"_type": "video", url: 'http://www.youtube.com/watch?v=Lnc2GU99O8s'});
      },
      findImage: function(options, callback) {
        callback({type : 'image', url : sandbox.imageUrl(sandbox.randSize(), sandbox.randSize()), info : {source : sandbox.imageServiceURL}});
      },
      getEditableImage: function(url, callback){
        // The url is already editable
        sandbox.log(callback(url));
      }
    },
    url: {},
    document: {
      readyToPost: function(value){
        if(mode == 'play'){
          sandbox.log('a call to post.valid(value) is useless when in player');
          return;
        }
        postButton.disabled = !value;
        if(value){
          postButton.className += ' btn-primary';
        } else {
          postButton.className = postButton.className.replace(/ btn-primary/g, '');
        }
      },
      __note : 'test',
      setNote: function(note) {
        document.getElementById('postNote').innerHTML = note;
      },
      users: function(ids, callback) {
        var results = [];
        for(var i = 0; i < ids.length; i++){
          results.push(sandbox.User.find(ids[i]));
        }
        callback(results);
      },
      getUserData: function(callback) {
        callback(sandbox.User.find(currentUser.uuid));
      },
      queueUp: function(text, callback) {
        callback(Math.floor(Math.random() * 10000));
      },
      geoLocation: function(callback) {
          callback(40.7142,74.0064);
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
          mode: (mode == 'edit' ? 'edit' : 'view'),
          documentURL: '/posts/' + post.uuid,
          documentId: post.uuid,
          documentPrivacy: 'public',
          collections: post.collections,
          currentUserId: currentUser.uuid,
          postUserId: post.postUserId,
          host: 'localhost:3333',
          assetPath: 'http://expressions',
          note : post.note,
          sandbox: true,
          apiVersion: expression.apiVersion,
          version: expression.version,
          scrollValues: {} // XXX Need to be imported
        }
      };
      expressionFrame.contentWindow.postMessage(JSON.stringify(readyMessage), '*');
    },
    sendPostMessage: function(callback){
      expressionFrame.contentWindow.postMessage(JSON.stringify({type: 'post'}), '*');
    },
    sendEvent: function(name, args){
      if(expressionFrame){
        expressionFrame.contentWindow.postMessage(JSON.stringify({type: 'triggerEvent', eventName: name, eventArgs: args}), '*');
      }
    },
    post: function() {
      handlePostAction();
    },
    posted: function(){
      post.state = 'published';
      currentUser.numberOfUse += 1;
      currentUser.numberOfPost += 1;
      // Ridiculous timeout to avoid having 2 async file writer...
      setTimeout(
        function(){
          sandbox.Post.save(post, function(err, post){
            if(err){
              sandbox.log(err);
            } else {
              application.navigate('post/' + post.uuid + '/play');
            }
          });
        }, 200);
    }
  };

  // Load the iframe content with the editor.
  var load = function(src, callback){
    async.parallel([
      // Wait for iframe
      function(cb){
        var waitLoaded = function(event, callback){
          expressionFrame.removeEventListener('load', waitLoaded, false);
          cb(null, true);
        };
        expressionFrame.addEventListener('load', waitLoaded, false);
      },
      // Create a post
      function(cb){
        cb(null, post);
      }
    ], function(err, results){
      var post = results[1];
      if(mode == 'edit'){
        post.postUserId = currentUser.uuid;
      }
      api.sendReadyMessage(post);
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
      sandbox.log("method '" + data.methodName + "' not implemented. No callback will be fired.");
      sandbox.log("ignored call for " + data.methodName + "(", args, ")");
    } else {
      args.push(function(response){
        var data = JSON.parse(event.data);
        if (data.callbackId) {
          var res = {};
          res.result = [response];
          res.callbackId = data.callbackId;
          res.type = 'callback';
          expressionFrame.contentWindow.postMessage(JSON.stringify(res), '*');
        }
      });
      func.apply(post, args);
    }
  };

  var handleQuitAction = function(event){
    var state = api.container.popNavigation();
    if(state){
      state.callback();
    } else {
      application.navigate('');
    }
  };

  var handlePostAction = function(event){
    api.sendPostMessage();
  };

  var changeDeviceResolution = function(event) {
    event.preventDefault();
    expressionFrame.style.width = $(this).data('width');
    expressionFrame.style.height = $(this).data('height');
    if ('localStorage' in window && window['localStorage'] !== null) {
      localStorage.setItem("device", $(this).data('device'));
      location.reload(true);
    }
  };

  var currentScrollValues;
  var handleWindowScroll = function(){
    var scrollValues = getIframeScrollPosition();
    if(!currentScrollValues || (
      scrollValues.scrollBottom != currentScrollValues.scrollBottom ||
      scrollValues.scrollTop != currentScrollValues.scrollTop)){
      currentScrollValues = scrollValues;
      api.sendEvent('scrollChanged', currentScrollValues);
    }
  };

  var resizeBoundingBox = function(){
    var viewPortHeight = $(window).height();
    var viewPortWidth = $(window).width();
    if(expressionFrame && !fixedHeight){
      $(expressionFrame).height(viewPortHeight - expressionFrame.offsetTop - footer.offsetHeight - 100);
    }
    handleWindowScroll();
  };

  this.attach = function(node){
    // Attach DOM
    node.appendChild(sandbox.compile(templates[mode], {title: expression.title, postTitle: 'Untitled post'}));
    container = node.querySelector('.post-editor');
    postTitle = node.querySelector('.post-title');
    expressionFrame = node.querySelector('iframe');
    footer = node.querySelector('.expression-footer');
    boundingBox = node.querySelector('.expression-bounding-box');
    resizeBoundingBox();
    if(mode == 'play'){
      $(expressionFrame).height(0);
    }
    postButton = node.querySelector('.post-button');
    quitButton = node.querySelector('.quit-button');
    devicesButtons = document.querySelectorAll("#deviceSelector .dropdown-menu a");
    $(window)
      .on('resize', resizeBoundingBox)
      .on('scroll', handleWindowScroll);
    window.addEventListener('message', handleIframeMessage, false);
    $(postButton).on('click', handlePostAction)
      .attr('disabled', true);
    $(quitButton).on('click', handleQuitAction);
    if(mode == 'edit'){
      load('/expression/' + expression.location + '/editor.html');
    } else {
      load('/expression/' + expression.location + '/player.html');
    }

    if (devicesButtons && devicesButtons.length > 1) {
      for ( var i = 0,j=devicesButtons.length; i<j; i++) {
        devicesButtons[i].addEventListener('click', changeDeviceResolution, false);
      }
    }
  };

  this.detach = function(node){
    expressionFrame = null;
    $(window)
      .off('resize', resizeBoundingBox)
      .off('scroll', handleWindowScroll);
    window.removeEventListener('message', handleIframeMessage, false);
    $(quitButton).off('click', handleQuitAction);
    $(postButton).off('click', handlePostAction);
    if (devicesButtons && devicesButtons.length > 1) {
      for ( var i = 0,j=devicesButtons.length; i<j; i++) {
        devicesButtons[i].removeEventListener('click', changeDeviceResolution, false);
      }
    }
    node.innerHTML = "";
  };
};