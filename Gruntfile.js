bower = require('bower');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    downloadComponents: {
      components: grunt.file.readJSON('components.json'),
      directory: 'components'
    }
  });

  grunt.registerTask('downloadComponents', function(){
    for(var name in config.components){
      var versions = config.components[name];
      console.log(name, versions);
      counter ++;
      bower.commands
        .install([name], {})
        .on('end', handlePackageInstalled)
        .on('error', handleError);
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['downloadComponents']);

};
