define(['angular'], function (angular) {
  'use strict';

  var module = angular.module('cb.directives.focusme', []);

  module.directive('cbFocusMe', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(attrs.cbFocusMe, function(value) {
          if (value === true) {
            console.log('value=',value);
            $timeout(function() {
              element[0].focus();
              scope[attrs.cbFocusMe] = false;
            });
          }
        });
      }
    };
  });
});