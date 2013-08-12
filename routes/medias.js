var path = require('path'),
		fs   = require('fs');

module.exports = function(app){
	app.get('/medias/get/*', function(req, res){
		var params = req.params[0].split("/");
	 	//res.send(getImage(params));
	 	if (params[0] === 'image') {
	 		getImage(params, function(err, dst){
      	if (err){
       		console.error(err);
          return next();
        }
       res.sendfile(dst.outname);
       });
	 		} else {
	 			res.send("nothing");
	 		}
	 	}
	 );
	app.post('/image/save*', function(req, res){
		var base64Data = req.body.file.replace(/^data:image\/png;base64,/,"");

		fs.writeFile(path.resolve(__dirname, '../public/sandboxImg/resized/'+req.body.filename), base64Data, 'base64', function(err) {
  		if (!err) {
  			console.log("SAVED");
  			res.end();
  		}
		});

	});
}