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
        },
        ignores: ['<%= boardJsFile %>', 'migration.js', 'public/assets/plugins/**/lib/*.js']
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['jshint']);

};