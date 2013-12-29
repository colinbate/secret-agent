define(['game/events'], function (events) {
  'use strict';

  var infoController = function ($scope) {
    // UI ACTIONS -------------------------------------------

    $scope.startPlaying = function () {
      $scope.$root.$broadcast('game:start');
    };

    $scope.submitName = function () {
      $scope.info.state = 2;
      if ($scope.isMaster()) {
        $scope.$root.$broadcast('player:add', $scope.info.name);
        $scope.sendMessage(events.masterJoin);
      } else {
        $scope.$root.$broadcast('player:add', $scope.info.name);
        $scope.sendMessage(events.join, {name: $scope.info.name});
      }
    };
  };
  infoController.$inject = ['$scope'];
  infoController.ctrlName = 'InfoController';

  return infoController;
});