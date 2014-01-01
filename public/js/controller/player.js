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

    $scope.$on('game:start', function (e, opts) {
      $scope.sendStartGame(opts);
    });

    $scope.$on('turn:all:end', function () {
      $scope.sendNewTurn();
    });

    $scope.$on('turn:move', function (e, info) {
      $scope.handleMoveAgent(info);
    });

    $scope.$on('turn:move:file:other', function () {
      $scope.announceRemoteFileMove();
    });

    // INTERNAL STATE MANAGEMENT ----------------------------

    $scope.addPlayer = function (name) {
      $scope.players.list.push({name: name});
    };

    // GAME FLOW MANAGEMENT ---------------------------------

    $scope.sendStartGame = function (opts) {
      if ($scope.isMaster()) {
        $scope.sendMessage(events.startGame, {players: $scope.players.list, opts: opts});
      }
    };

    $scope.sendNewTurn = function () {
      if ($scope.isMaster()) {
        $scope.sendMessage(events.newTurn, {name: $scope.players.list[nextPosition()].name}, true);
      }
    };

    $scope.announceRemoteFileMove = function () {
      $scope.setHelp('Points tallied...<br>' + $scope.players.current.name + ' is moving the safe.');
    };

    $scope.checkIfWinner = function (winners) {
      var ii;
      for (ii = 0; ii < winners.length; ii += 1) {
        if ($scope.info.agent === winners[ii]) {
          $scope.setHelp('You won!!');
          return;
        }
      }
      $scope.setHelp('Sorry, you didn\'t win this time...');
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
        if ($scope.isMe(msg.name)) {
          $scope.setHelp('Great, all done.');
        } else {
          $scope.setHelp(msg.name + ' has finished moving.');
        }
        $scope.$root.$broadcast('turn:moving:end');
      } else {
        if ($scope.isMe(msg.name)) {
          $scope.setHelp('Good, only ' + $scope.players.current.remaining + ' more...' );
        } else {
          $scope.setHelp(msg.name + ' has ' + $scope.players.current.remaining + ' more.');
        }
      }
    };

    $scope.handleGameOver = function (msg) {
      $scope.players.winners = msg.winners;
      $scope.checkIfWinner(msg.winners);
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
      var classes = [];
      if ($scope.players.current.rolled && $scope.players.current.remaining) {
        classes.push('die');
        classes.push($scope.getDieClass($scope.players.current.rolled));
      }
      return classes;
    };

  };
  playerController.$inject = ['$scope'];
  playerController.ctrlName = 'PlayerController';

  return playerController;
});