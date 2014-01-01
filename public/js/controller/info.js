define(['game/events', 'game/data'], function (events, data) {
  'use strict';

  var infoController = function ($scope, $window) {
    var randomInt = function (max, min) {
          return parseInt(Math.floor(Math.random() * (max - min + 1) + min), 10);
        };

    $scope.opts = {
      extraAgents: 2,
      safeLocation: 7
    };
    $scope.randomSafe = false;

    // UI ACTIONS -------------------------------------------

    $scope.startPlaying = function () {
      if ($scope.randomSafe) {
        $scope.opts.safeLocation = randomInt(data.locations.length - 1, 1);
      }
      $scope.$root.$broadcast('game:start', $scope.opts);
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
      return $window.location.protocol + '//' + $window.location.host + '/#' + $scope.info.id;
    };
  };
  infoController.$inject = ['$scope', '$window'];
  infoController.ctrlName = 'InfoController';

  return infoController;
});