module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['connect:server:keepalive']);

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          base: 'app'
        }
      }
    }
  });
};
