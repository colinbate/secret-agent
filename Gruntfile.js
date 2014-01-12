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
    autoprefixer: {
      secret: {
        options: {
          diff: true
        },
        src: 'public/css/secret.css'
      }
    },
    watch: {
      less: {
        files: ['less/**/*.less'],
        tasks: 'cssdev'
      },
      js: {
        files: ['*.js', 'public/js/**/*.js'],
        tasks: 'jshint'
      }
    },
    requirejs: {
      main: {
        options: {
          baseUrl: 'public/js',
          mainConfigFile: 'public/js/main.js',
          paths: {'primus': 'empty:'},
          out: 'dist/js/main.js',
          name: 'main',
          exclude: ['primus']
        }
      },
      primus: {
        options: {
          baseUrl: 'public/lib',
          out: 'dist/lib/primus.js',
          name: 'primus'
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
      imgs: {
        files: [{ expand: true, cwd: 'public/img/', src: ['**'], dest: 'dist/img/' }]
      },
      libs: {
        files: {
          'dist/lib/require.js': ['public/lib/require.js']
        }
      }
    },
    shell: {
      genlib: {
        command: 'node server.js genlib'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-csso');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('cssdev', ['less:dev', 'autoprefixer']);
  grunt.registerTask('css', ['less:clean', 'autoprefixer']);
  grunt.registerTask('opt', ['jshint', 'less:clean', 'autoprefixer', 'csso:compress', 'copy', 'shell:genlib', 'requirejs']);
  grunt.registerTask('default', ['css', 'jshint']);

};