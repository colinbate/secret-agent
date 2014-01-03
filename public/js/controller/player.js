define(['game/events'], function (events) {
  'use strict';

  var playerController = function ($scope) {
    var validateNewPlayer = function () {
          if ($scope.players.list.length === 7 || $scope.info.state > 2) {
            return false;
          }
          return true;
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
      $scope.addPlayer(name, undefined, $scope.info.role);
    });

    $scope.$on('player:add:id', function (e, info) {
      $scope.setPlayerField(info.name, info.id, 'id');
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

    $scope.addPlayer = function (name, id, role) {
      $scope.players.list.push({name: name, id: id, role: role});
    };

    $scope.setPlayerField = function (name, value, field) {
      var ii;
      for (ii = 0; ii < $scope.players.list.length; ii += 1) {
        if ($scope.players.list[ii].name === name) {
          $scope.players.list[ii][field] = value;
          break;
        }
      }
    };

    $scope.removePlayerById = function (id) {
      return $scope.removePlayerBy('id', id);
    };

    $scope.removePlayerByName = function (name) {
      return $scope.removePlayerBy('name', name);
    };

    $scope.removePlayerBy = function (field, value) {
      var ii;
      for (ii = 0; ii < $scope.players.list.length; ii += 1) {
        if ($scope.players.list[ii][field] === value) {
          if ($scope.players.current.position >= ii) {
            $scope.players.current.position -= 1;
          }
          return $scope.players.list.splice(ii, 1)[0];
        }
      }
    };

    $scope.setAgentForPlayer = function (name, agent, winners) {
      var ii, jj;
      for (ii = 0; ii < $scope.players.list.length; ii += 1) {
        if ($scope.players.list[ii].name === name) {
          $scope.players.list[ii].agent = $scope.getAgent(agent);
          for (jj = 0; jj < winners.length; jj += 1) {
            if (winners[jj] === agent) {
              $scope.players.list[ii].winner = true;
              break;
            }
          }
          break;
        }
      }
    };

    // GAME FLOW MANAGEMENT ---------------------------------

    $scope.sendStartGame = function (opts) {
      if ($scope.isMaster()) {
        $scope.sendMessage(events.startGame, {players: $scope.players.list, opts: opts || {}});
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
      if (validateNewPlayer()) {
        $scope.sendMessage(events.identify, {names: $scope.players.list, dest: msg.source});
      }
    };

    $scope.handleIdentify = function (msg) {
      if (!$scope.identified) {
        $scope.players.list = msg.names;
        $scope.identified = true;
      }
    };

    $scope.handleJoin = function (msg) {
      if ($scope.players.list.length === 7 ) {
        return;
      }
      if (validateNewPlayer()) {
        $scope.addPlayer(msg.name, msg.id, 'player');
      }
    };

    $scope.handleLeft = function (msg) {
      var departed = $scope.removePlayerById(msg.id);
      if ($scope.players.list.length === 1) {
        // Only one left :(
        $scope.setHelp('Game over. Everyone else left.');
        $scope.info.state = 4;
        $scope.$root.$broadcast('game:over');
      } else {
        if (departed.role === 'master' && $scope.isMe($scope.players.list[nextPosition()].name)) {
          // I will inherit the master role!
          $scope.info.role = 'master';
          $scope.sendMessage(events.promote, {name: $scope.info.name});
        }
        if ($scope.players.current.name === departed.name) {
          $scope.sendNewTurn();
        }
      }
    };

    $scope.handlePromote = function (msg) {
      $scope.setPlayerField(msg.name, 'master', 'role');
    };

    $scope.handleStartGame = function (msg) {
      // you, playOrder, agents
      $scope.players.list = msg.playOrder;
      $scope.setAgentForPlayer($scope.info.name, msg.you, []);
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
      //$scope.handleRevealSelf({name: $scope.info.name, agent: $scope.info.agent});
    };

    $scope.handleRevealSelf = function (msg) {
      $scope.setAgentForPlayer(msg.name, msg.agent, $scope.players.winners);
    };

    events.onMessage(events.hello, $scope, $scope.handleHello);
    events.onMessage(events.identify, $scope, $scope.handleIdentify);
    events.onMessage(events.join, $scope, $scope.handleJoin);
    events.onMessage(events.promote, $scope, $scope.handlePromote);
    events.onMessage(events.left, $scope, $scope.handleLeft);
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
      if (player.agent) {
        classes.push('agent-card');
        classes.push(player.agent.card);
      }
      return classes;
    };

    $scope.myAgent = function () {
      var me = $scope.getMe();
      return me.agent || {};
    };

    $scope.currentPlayerDie = function (player) {
      var classes = [];
      if ($scope.players.current && $scope.players.current.name === player.name &&
        $scope.players.current.rolled && $scope.players.current.remaining) {
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