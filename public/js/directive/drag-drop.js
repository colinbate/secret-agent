define(['angular', 'dragster', 'service/id'], function (angular, Dragster) {
  'use strict';

  var module = angular.module('cb.directives.dragdrop', ['cb.services.id']),
      ensureId = function (elem, idSvc) {
        var id = angular.element(elem).attr('id');
        if (!id) {
          id = idSvc.random(10);
          angular.element(elem).attr('id', id);
        }
        return id;
      },
      dragsterIt = function (elem) {
        return new Dragster(elem[0]);
      };

  module.directive('cbDraggable', ['$rootScope', 'id', function($rootScope, uuid) {
    return {
      restrict: 'A',
      link: function(scope, el) {
        angular.element(el).attr('draggable', 'true');
        
        el.bind('dragstart', function(e) {
          var id = ensureId(el, uuid);
          e.dataTransfer.setData('text', id);
          $rootScope.$broadcast('cb:drag:start', el);
        });
        
        el.bind('dragend', function() {
          $rootScope.$broadcast('cb:drag:end', el);
        });
      }
    };
  }]);

  module.directive('cbDropTarget', ['$rootScope', 'id', function($rootScope, uuid) {
    return {
      restrict: 'A',
      scope: {
          onDrop: '&'
      },
      link: function(scope, el) {
        dragsterIt(el);
        el.bind('dragover', function(e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }
          
          e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
          return false;
        });
        
        el.bind('dragster:enter', function(e) {
          // this / e.target is the current hover target.
          angular.element(e.target).addClass('cb-dnd-over');
        });
        
        el.bind('dragster:leave', function(e) {
          angular.element(e.target).removeClass('cb-dnd-over');  // this / e.target is previous target element.
        });
        
        el.bind('drop', function(e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }

          if (e.stopPropogation) {
            e.stopPropogation(); // Necessary. Allows us to drop.
          }

          var id = ensureId(el, uuid),
              data = e.dataTransfer.getData('text'),
              dest = document.getElementById(id),
              src = document.getElementById(data);
          
          scope.onDrop({dragEl: src, dropEl: dest});
        });

        $rootScope.$on('cb:drag:start', function() {
            angular.element(el).addClass('cb-dnd-target');
        });
        
        $rootScope.$on('cb:drag:end', function() {
            angular.element(el).removeClass('cb-dnd-target');
            angular.element(el).removeClass('cb-dnd-over');
        });
      }
    };
  }]);
});