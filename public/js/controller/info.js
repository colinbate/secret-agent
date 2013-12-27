define(['game/events'], function (events) {
  'use strict';

  var infoController = function ($scope, messages) {
    $scope.startPlaying = function () {
      $scope.info.state = 2;
      if ($scope.isMaster()) {
        $scope.info.agents = [$scope.info.name];
        messages.send(events.masterJoin);
      } else {
        messages.send(events.join, {name: $scope.info.name});
      }
    };

    $scope.infoState = function () {
      var classes = [];
      if ($scope.info.state === 1) {
        classes.push('state-show');
      }
      return classes;
    };

  };
  infoController.$inject = ['$scope', 'messages'];
  infoController.ctrlName = 'InfoController';

  return infoController;
});