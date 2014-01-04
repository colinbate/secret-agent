define(['game/events', 'game/data'], function (events, data) {
  'use strict';

  var infoController = function ($scope, $window) {
    var randomInt = function (max, min) {
          return parseInt(Math.floor(Math.random() * (max - min + 1) + min), 10);
        },
        state = {INIT: 0, PROMPT: 1, ERROR: 2},
        states = ['init', 'prompt', 'error'];

    $scope.opts = {
      extraAgents: 2,
      safeLocation: 7
    };
    $scope.randomSafe = false;
    $scope.preState = 0;
    $scope.joiners = [];

    // UI ACTIONS -------------------------------------------

    $scope.startPlaying = function () {
      if ($scope.randomSafe) {
        $scope.opts.safeLocation = randomInt(data.locations.length - 1, 1);
      }
      $scope.$root.$broadcast('game:start', $scope.opts);
    };

    $scope.submitName = function () {
      $scope.info.state = 2;
      $scope.$root.$broadcast('player:add', $scope.info.name);
      if ($scope.isMaster()) {
        $scope.createNewGame();
      } else {
        $scope.sendMessage(events.join, {name: $scope.info.name});
      }
    };

    $scope.fullUrl = function () {
      return $window.location.protocol + '//' + $window.location.host + '/#' + $scope.info.id;
    };

    $scope.stateClass = function () {
      var classes = [];
      classes.push(states[$scope.preState]);
      return classes;
    };

    $scope.addJoiner = function (name) {
      if ($scope.joiners.length < 7 && $scope.info.state <= 2) {
        $scope.joiners.push({name: name});
      }
    };

    // EVENT HANDLERS ---------------------------------------

    $scope.$on('player:add', function (e, name) {
      $scope.addJoiner(name);
    });

    // MESSAGE HANDLERS -------------------------------------

    $scope.handleIdentify = function (msg) {
      $scope.joiners = msg.names;
      $scope.preState = state.PROMPT;
    };

    $scope.handleJoin = function (msg) {
      $scope.addJoiner(msg.name);
    };

    $scope.handleCannotJoin = function () {
      $scope.preState = state.ERROR;
    };

    events.onMessage(events.identify, $scope, $scope.handleIdentify);
    events.onMessage(events.join, $scope, $scope.handleJoin);
    events.onMessage(events.cannotJoin, $scope, $scope.handleCannotJoin);

  };
  infoController.$inject = ['$scope', '$window'];
  infoController.ctrlName = 'InfoController';

  return infoController;
});