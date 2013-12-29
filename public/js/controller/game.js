define(['game/data', 'game/events'], function (data, events) {
  'use strict';

  var gameController = function ($scope, messages) {
    $scope.info = {
      id: '',
      state: 0,
      name: '',
      role: '',
      agent: null,
      agents: [],
    };

    $scope.getAgent = function (index) {
      if (!data.agents || data.agents.length <= index) {
        $scope.setError('Trying to access agent ' + index + ' which does not exist');
        return;
      }
      return data.agents[index];
    };

    $scope.getLocation = function (index) {
      if (!data.locations || data.locations.length <= index) {
        $scope.setError('Trying to access location ' + index + ' which does not exist');
        return;
      }
      return data.locations[index];
    };

    $scope.locationCount = function () {
      return data.locations.length;
    };

    $scope.setError = function (msg) {
      console.log(msg);
    };

    $scope.getMe = function () {
      var agentInfo = $scope.info.agent === null ? null : $scope.getAgent($scope.info.agent);
      return {name: $scope.info.name, agent: agentInfo};
    };

    $scope.isMe = function (name) {
      return name === $scope.info.name;
    };

    $scope.isMaster = function () {
      return $scope.info.role === 'master';
    };

    $scope.sendMessage = function (action, msg, sendLocal) {
      messages.send(action, msg, sendLocal);
    };

    // EVENT HANDLERS ---------------------------------------

    // MESSAGE HANDLERS -------------------------------------

    $scope.handleGameCreated = function (msg) {
      $scope.info.id = msg.id;
      $scope.info.state = 1;
    };

    $scope.handleIdentify = function () {
      if ($scope.info.state === 0) {
        $scope.info.state = 1;
      }
    };

    $scope.handleStartGame = function (msg) {
      // you, playOrder, agents
      $scope.info.agent = msg.you;
      $scope.info.agents = msg.agents;
      $scope.info.state = 3;
    };

    $scope.handleNewTurn = function (msg) {
      if ($scope.isMe(msg.name)) {
        $scope.sendMessage(events.rollDie, {name: msg.name});
      }
    };

    $scope.handleGameOver = function () {
      $scope.info.state = 4;
      $scope.sendMessage(events.revealSelf, {name: $scope.info.name, agent: $scope.info.agent});
    };

    events.onMessage(events.gameCreated, $scope, $scope.handleGameCreated);
    events.onMessage(events.identify, $scope, $scope.handleIdentify);
    events.onMessage(events.startGame, $scope, $scope.handleStartGame);
    events.onMessage(events.newTurn, $scope, $scope.handleNewTurn);
    events.onMessage(events.gameOver, $scope, $scope.handleGameOver);

    // UI STATE MANAGEMENT ----------------------------------

    $scope.gameState = function () {
      var classes = [],
          currentState = data.states[$scope.info.state];

      classes.push(currentState);

      if ($scope.info.role) {
        classes.push($scope.info.role + '-role');
      }

      return classes;
    };

    // INITIALIZE GAME STATE --------------------------------

    $scope.initialize = function () {
      var gameId = messages.getGameId();
      if (gameId) {
        $scope.info.role = 'player';
        $scope.info.id = gameId;
        messages.send(events.hello);
        console.log('Joining game (' + gameId + ') in controller.');
      } else {
        $scope.info.role = 'master';
        messages.send(events.newGame);
        console.log('Setting up new game in controller.');
      }
    };
    $scope.initialize();

  };
  gameController.$inject = ['$scope', 'messages'];
  gameController.ctrlName = 'GameController';

  return gameController;
});