define(['game/events'], function (events) {
  'use strict';

  var infoController = function ($scope, $window) {
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

    $scope.fullUrl = function () {
      return $window.location.protocol + '//' + $window.location.host + '/' + $scope.info.id;
    };
  };
  infoController.$inject = ['$scope', '$window'];
  infoController.ctrlName = 'InfoController';

  return infoController;
});