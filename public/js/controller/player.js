define(['game/events'], function (events) {
  'use strict';

  var playerController = function ($scope) {
    var validateNewPlayer = function () {
          if ($scope.players.list.length === 7) {
            $scope.sendMessage(events.cannotJoin, {reason: 'full'});
            return;
          }
        },
        nextPosition = function () {
          return ($scope.players.current.position + 1) % $scope.players.list.length;
        };

    // STATE ------------------------------------------------

    $scope.identified = false;
    $scope.players = {
      list: [],
      winners: [],
      current: {
        position: -1,
        name: null,
        rolled: null,
        remaining: null
      }
    };

    // EVENT HANDLING ---------------------------------------

    $scope.$on('player:add', function (e, name) {
      $scope.addPlayer(name);
    });

    $scope.$on('game:start', function () {
      $scope.sendStartGame();
    });

    $scope.$on('turn:all:end', function () {
      $scope.sendNewTurn();
    });

    $scope.$on('turn:move', function (e, delta) {
      $scope.handleMoveAgent({delta: delta});
    });

    // INTERNAL STATE MANAGEMENT ----------------------------

    $scope.addPlayer = function (name) {
      $scope.players.list.push({name: name});
    };

    // GAME FLOW MANAGEMENT ---------------------------------

    $scope.sendStartGame = function () {
      if ($scope.isMaster()) {
        $scope.sendMessage(events.startGame, {players: $scope.players.list});
      }
    };

    $scope.sendNewTurn = function () {
      if ($scope.isMaster()) {
        $scope.sendMessage(events.newTurn, {name: $scope.players.list[nextPosition()].name}, true);
      }
    };

    // MESSAGE HANDLERS -------------------------------------

    $scope.handleHello = function (msg) {
      if (!$scope.isMaster()) {
        return;
      }
      validateNewPlayer();
      $scope.sendMessage(events.identify, {names: $scope.players.list, dest: msg.source});
    };

    $scope.handleIdentify = function (msg) {
      if (!$scope.identified) {
        $scope.players.list = msg.names;
        $scope.identified = true;
      }
    };

    $scope.handleJoin = function (msg) {
      validateNewPlayer();
      $scope.addPlayer(msg.name);
      if ($scope.players.list.length === 7) {
        $scope.sendStartGame();
      }
    };

    $scope.handleStartGame = function (msg) {
      // you, playOrder, agents
      $scope.players.list = msg.playOrder;
      if ($scope.isMaster()) {
        if (!msg.playOrder || msg.playOrder.length === 0) {
          console.warn('No players specified in startGame!');
          return;
        }
        // Tell everyone to start playing.
        $scope.sendMessage(events.newTurn, {name: msg.playOrder[nextPosition()].name}, true);
      }
    };

    $scope.handleNewTurn = function (msg) {
      $scope.players.current.position = nextPosition();
      $scope.players.current.rolled = null;
      $scope.players.current.remaining = null;
      $scope.players.current.name = msg.name;
    };

    $scope.handleRolledDie = function (msg) {
      $scope.players.current.rolled = msg.value;
      $scope.players.current.remaining = msg.value;
    };

    $scope.handleMoveAgent = function (msg) {
      $scope.players.current.remaining -= msg.delta[1];

      if ($scope.players.current.remaining < 0) {
        $scope.setError('Too many moves taken!');
        return;
      }
      if ($scope.players.current.remaining === 0) {
        $scope.$root.$broadcast('turn:moving:end');
      }
    };

    $scope.handleGameOver = function (msg) {
      $scope.players.winners = msg.winners;
      $scope.handleRevealSelf({name: $scope.info.name, agent: $scope.info.agent});
    };

    $scope.handleRevealSelf = function (msg) {
      var ii, jj;
      for (ii = 0; ii < $scope.players.list.length; ii += 1) {
        if ($scope.players.list[ii].name === msg.name) {
          $scope.players.list[ii].agent = $scope.getAgent(msg.agent);
          for (jj = 0; jj < $scope.players.winners.length; jj += 1) {
            if ($scope.players.winners[jj] === msg.agent) {
              $scope.players.list[ii].winner = true;
              break;
            }
          }
          break;
        }
      }
    };

    events.onMessage(events.hello, $scope, $scope.handleHello);
    events.onMessage(events.identify, $scope, $scope.handleIdentify);
    events.onMessage(events.join, $scope, $scope.handleJoin);
    events.onMessage(events.startGame, $scope, $scope.handleStartGame);
    events.onMessage(events.newTurn, $scope, $scope.handleNewTurn);
    events.onMessage(events.rolledDie, $scope, $scope.handleRolledDie);
    events.onMessage(events.moveAgent, $scope, $scope.handleMoveAgent);
    events.onMessage(events.gameOver, $scope, $scope.handleGameOver);
    events.onMessage(events.revealSelf, $scope, $scope.handleRevealSelf);

    // UI STATE MANAGEMENT ----------------------------------

    $scope.playerClass = function (player) {
      var classes = [];
      if ($scope.players.current && $scope.players.current.name === player.name) {
        classes.push('current-turn');
      }
      if ($scope.isMe(player.name)) {
        classes.push('viewing-player');
      }
      if (player.winner) {
        classes.push('winning-player');
      }
      return classes;
    };

    $scope.myAgent = function () {
      var me = $scope.getMe();
      return me.agent || {};
    };

    $scope.currentDieValue = function () {
      if ($scope.players.current.rolled && $scope.players.current.remaining) {
        return $scope.players.current.remaining + ' / ' + $scope.players.current.rolled;
      }
      return '- / -';
    };

  };
  playerController.$inject = ['$scope'];
  playerController.ctrlName = 'PlayerController';

  return playerController;
});