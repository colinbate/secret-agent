define(['game/data', 'game/events'], function (data, events) {
  'use strict';

  var gameController = function ($scope, messages, $sce, idSvc) {
    $scope.info = {
      id: '',
      state: 1,
      name: '',
      role: '',
      agent: null,
      agents: [],
    };
    $scope.newGameAttempts = 0;
    $scope.game = {
      message: ''
    };

    // CONVENIENCE FUNCTIONS --------------------------------

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

    $scope.setHelp = function (msg) {
      $scope.game.message = msg;
    };

    $scope.getHelp = function () {
      return $sce.trustAsHtml($scope.game.message);
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
      $scope.info.state = 2;
      $scope.newGameAttempts = 0;
      $scope.$root.$broadcast('player:add:id', {name: $scope.info.name, id: msg.pid});
    };

    $scope.handleCannotCreate = function (msg) {
      if ($scope.newGameAttempts >= 5) {
        $scope.setError('Could not find a unique game...');
        $scope.info.state = 0;
        return;
      }
      if (msg.reason === 'already exists') {
        $scope.newGameAttempts += 1;
        $scope.info.id = '';
        $scope.createNewGame();
      } else {
        $scope.setError('Could not create game: ' + msg.reason);
        $scope.info.state = 0;
      }
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
        $scope.setHelp('Your turn! Click or drag the agents to move them');
      } else {
        $scope.setHelp('Waiting for ' + msg.name + '...');
      }
    };

    $scope.handleGameOver = function () {
      $scope.info.state = 4;
      $scope.sendMessage(events.revealSelf, {name: $scope.info.name, agent: $scope.info.agent});
    };

    events.onMessage(events.gameCreated, $scope, $scope.handleGameCreated);
    events.onMessage(events.cannotCreate, $scope, $scope.handleCannotCreate);
    events.onMessage(events.identify, $scope, $scope.handleIdentify);
    events.onMessage(events.startGame, $scope, $scope.handleStartGame);
    events.onMessage(events.newTurn, $scope, $scope.handleNewTurn);
    events.onMessage(events.gameOver, $scope, $scope.handleGameOver);

    // GAME FLOW LOGIC --------------------------------------

    $scope.createNewGame = function (id) {
      $scope.info.id = id || idSvc.random(9);
      messages.connect($scope.info.id);
      messages.send(events.newGame, {id: $scope.info.id});
    };

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

    $scope.chat = function () {
      $scope.$root.$broadcast('chat:open');
    };

    $scope.sniffKeys = function (ev) {
      if (ev && ev.keyCode) {
        if (ev.keyCode === 27) {
          $scope.$root.$broadcast('chat:close');
        }
      }
    };

    $scope.getDieClass = function (roll) {
      if (roll < 1 || roll > 6) {
        $scope.setError('Invalid roll of the die: ' + roll);
        return;
      }
      return data.dice[roll - 1];
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
        console.log('No joining game id, primed to create a new one.');
      }
    };
    $scope.initialize();

  };
  gameController.$inject = ['$scope', 'messages', '$sce', 'id'];
  gameController.ctrlName = 'GameController';

  return gameController;
});