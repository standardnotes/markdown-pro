module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['src/**/*.js'],
        tasks: ['babel', 'browserify'],
        options: {
          spawn: false,
        },
      },
    },

   babel: {
        options: {
            sourceMap: true,
            presets: ['es2015']
        },
        dist: {
            files: {
                'dist/dist.js': [
                  'src/index.js',
                ]
            }
        }
    },

    browserify: {
      dist: {
        files: {
          'dist/dist.js': 'dist/dist.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['babel', 'browserify']);
};
