define(['angular'], function (angular) {
  'use strict';

  var module = angular.module('cb.services.id', []);

  module.factory('id', function () {
    return {
      random: function (length, prefix) {
        var buffer = '';
        length = length || 8;
        while (length) {
          buffer += (0|Math.random()*36).toString(36);
          length -= 1;
        }
        return (prefix || '') + buffer;
      }
    };
  });
});