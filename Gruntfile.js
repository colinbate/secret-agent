/* global module:false */
module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner:
        '/*!\n' +
        ' * Secret Agent <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd, HH:MM") %>)\n' +
        ' * http://bitbucket.org/colinbate/secret-agent\n' +
        ' * MIT licensed\n' +
        ' *\n' +
        ' * Copyright (C) 2014 Colin Bate, http://colinbate.com\n' +
        ' */\n'
    },
    jshint: {
      options: {
        bitwise: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonew: true,
        plusplus: true,
        quotmark: true,
        sub: true,
        strict: true,
        undef: true,
        unused: true,
        trailing: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          define: false,
          require: false,
          module: false,
          console: false
        }
      },
      files: ['*.js', 'public/js/**/*.js']
    },
    less: {
      dev: {
        options: {
          dumpLineNumbers: 'mediaquery'
        },
        files: {
          'public/css/secret.css': 'less/core.less',
        }
      },
      clean: {
        files: {
          'public/css/secret.css': 'less/core.less',
        }
      }
    },
    watch: {
      less: {
        files: ['less/**/*.less'],
        tasks: 'less:dev'
      },
      js: {
        files: ['*.js', 'public/js/**/*.js'],
        tasks: 'jshint'
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: 'public/js',
          mainConfigFile: 'public/js/main.js',
          out: 'dist/js/main.js',
          name: 'main'
        }
      }
    },
    csso: {
      compress: {
        options: {
          report: 'gzip'
        },
        files: {
          'dist/css/secret.css': ['public/css/secret.css']
        }
      }
    },
    copy: {
      html: {
        files: {
          'dist/index.html': ['public/index.html']
        }
      },
      libs: {
        files: {
          'dist/lib/require.js': ['public/lib/require.js']
        }
      }
    },
    execute: {
      genlib: {
        src: ['server.js genlib']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-csso');
  grunt.loadNpmTasks('grunt-execute');

  grunt.registerTask('default', ['less:clean', 'jshint']);
  grunt.registerTask('opt', ['jshint', 'less:clean', 'csso:compress', 'copy', 'execute:genlib', 'requirejs:compile']);

};