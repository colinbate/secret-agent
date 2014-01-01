define(['game/events', 'game/data'], function (events, data) {
  'use strict';

  var boardController = function ($scope) {
    var boardStates = ['waiting', 'moving-agents', 'moving-file'],
        state = {WAIT: 0, MOVE_AGENTS: 1, MOVE_FILE: 2},
        getMarker = function (aId, val) {
          var obj = [];
          obj.push(aId);
          obj.push(val || 0);
          return obj;
        },
        getTrack = function (max) {
          var track = [], tt;
          for (tt = 0; tt <= max; tt += 1) {
            track.push({score: tt, counters: []});
          }
          return track;
        };

    $scope.board = {
      file: 7,
      counters: [],
      agents: [],
      locations: data.locations,
      track: getTrack(42),
      state: state.WAIT
    };

    // INTERNAL STATE MANAGEMENT ----------------------------

    $scope.addAgentToLocation = function (agent, loc) {
      $scope.board.locations[loc].agents.push($scope.getAgent(agent));
    };

    $scope.removeAgentFromLocation = function (agent, loc) {
      var ii;
      for (ii = 0; ii < $scope.board.locations[loc].agents.length; ii += 1) {
        if ($scope.board.locations[loc].agents[ii].id === agent) {
          $scope.board.locations[loc].agents.splice(ii, 1);
          break;
        }
      }
    };

    $scope.moveAllAgentsToLocation = function (loc) {
      var ii;
      for (ii = 0; ii < $scope.board.locations.length; ii += 1) {
        $scope.board.locations[ii].agents = [];
      }
      for (ii = 0; ii < $scope.board.agents.length; ii += 1) {
        $scope.addAgentToLocation($scope.board.agents[ii][0], loc);
      }
    };

    $scope.addCounterToTile = function (agent, pos) {
      if (typeof pos === 'undefined' && agent.length) {
        pos = agent[1];
        agent = agent[0];
      }
      if (pos < 0) {
        pos = 0;
      } else if (pos >= $scope.board.track.length) {
        pos = $scope.board.track.length - 1;
      }
      $scope.board.track[pos].counters.push($scope.getAgent(agent));
    };

    $scope.removeCounterFromTile = function (agent, pos) {
      var ii;
      if (typeof pos === 'undefined' && agent.length) {
        pos = agent[1];
        agent = agent[0];
      }
      for (ii = 0; ii < $scope.board.track[pos].counters.length; ii += 1) {
        if ($scope.board.track[pos].counters[ii].id === agent) {
          $scope.board.track[pos].counters.splice(ii, 1);
          break;
        }
      }
    };

    $scope.moveAllCountersToTile = function (pos) {
      var ii;
      for (ii = 0; ii < $scope.board.track.length; ii += 1) {
        $scope.board.track[ii].counters = [];
      }
      for (ii = 0; ii < $scope.board.agents.length; ii += 1) {
        $scope.addCounterToTile($scope.board.agents[ii][0], pos);
      }
    };

    $scope.moveAgentDelta = function (delta) {
      var ii;
      for (ii = 0; ii < $scope.board.agents.length; ii += 1) {
        if ($scope.board.agents[ii][0] === delta[0]) {
          $scope.removeAgentFromLocation(delta[0], $scope.board.agents[ii][1]);
          $scope.board.agents[ii][1] = ($scope.board.agents[ii][1] + delta[1]) % $scope.locationCount();
          $scope.addAgentToLocation(delta[0], $scope.board.agents[ii][1]);
          break;
        }
      }
    };

    $scope.isAgentOnFile = function () {
      var ii;
      for (ii = 0; ii < $scope.board.agents.length; ii += 1) {
        if ($scope.board.agents[ii][1] === $scope.board.file) {
          return true;
        }
      }
      return false;
    };

    $scope.tally = function () {
      var ii, pts;
      for (ii = 0; ii < $scope.board.counters.length; ii += 1) {
        pts = $scope.getLocation($scope.board.agents[ii][1]).points;
        $scope.removeCounterFromTile($scope.board.counters[ii][0], $scope.board.counters[ii][1]);
        $scope.board.counters[ii][1] += pts;
        if ($scope.board.counters[ii][1] < 0) {
          $scope.board.counters[ii][1] = 0;
        }
        $scope.addCounterToTile($scope.board.counters[ii][0], $scope.board.counters[ii][1]);
      }
    };

    $scope.setCounters = function (counters) {
      var ii;
      if (counters.length !== $scope.board.counters.length) {
        $scope.setError('Old and new counters do not have the same number of items');
        return;
      }
      for (ii = 0; ii < $scope.board.counters.length; ii += 1) {
        if ($scope.board.counters[ii][1] !== counters[ii][1]) {
          $scope.removeCounterFromTile($scope.board.counters[ii]);
          $scope.addCounterToTile(counters[ii]);
        }
      }
      $scope.board.counters = counters;
    };

    $scope.haveAgentsFinished = function () {
      var ii, won = [];
      for (ii = 0; ii < $scope.board.counters.length; ii += 1) {
        if ($scope.board.counters[ii][1] >= 42) {
          won.push($scope.board.counters[ii][0]);
        }
      }
      return won;
    };

    // MESSAGE HANDLERS -------------------------------------

    $scope.handleStartGame = function (msg) {
      var alen = msg.agents.length, aidx;
      $scope.board.counters = [];
      $scope.board.agents = [];
      $scope.board.state = state.WAIT;
      $scope.board.file = msg.opts.safeLocation || 7;
      for (aidx = 0; aidx < alen; aidx += 1) {
        $scope.board.counters.push(getMarker(msg.agents[aidx]));
        $scope.board.agents.push(getMarker(msg.agents[aidx]));
      }
      $scope.moveAllAgentsToLocation(0);
      $scope.moveAllCountersToTile(0);
    };

    $scope.handleNewTurn = function () {
      $scope.board.state = state.WAIT;
    };

    $scope.handleRolledDie = function (msg) {
      if ($scope.isMe(msg.name)) {
        $scope.board.state = state.MOVE_AGENTS;
      }
    };

    $scope.handleMoveAgent = function (msg) {
      $scope.moveAgentDelta(msg.delta);
      // Reconcile msg.agents with $scope.board.agents
    };

    $scope.handleMoveFile = function (msg) {
      $scope.board.file = msg.position;
      $scope.$root.$broadcast('turn:all:end');
    };

    $scope.handleTally = function (msg) {
      var winners;
      $scope.setCounters(msg.counters);
      winners = $scope.haveAgentsFinished();
      if (!winners.length) {
        if ($scope.board.state === state.MOVE_AGENTS) {
          // Need to move file.
          $scope.board.state = state.MOVE_FILE;
          $scope.setHelp('Points tallied...<br>Please move the safe to a new location.');
        } else {
          // Someone else is moving file.
          $scope.$root.$broadcast('turn:move:file:other');
        }
      }
    };

    $scope.handleGameOver = function () {
      $scope.board.state = state.WAIT;
    };

    events.onMessage(events.startGame, $scope, $scope.handleStartGame);
    events.onMessage(events.newTurn, $scope, $scope.handleNewTurn);
    events.onMessage(events.rolledDie, $scope, $scope.handleRolledDie);
    events.onMessage(events.moveAgent, $scope, $scope.handleMoveAgent);
    events.onMessage(events.moveFile, $scope, $scope.handleMoveFile);
    events.onMessage(events.tally, $scope, $scope.handleTally);
    events.onMessage(events.gameOver, $scope, $scope.handleGameOver);

    // UI GAME INTERACTION ----------------------------------

    $scope.moveAgent = function (agent, steps) {
      var delta = [agent, steps];
      if ($scope.board.state === state.MOVE_AGENTS) {
        $scope.moveAgentDelta(delta);
        $scope.sendMessage(events.moveAgent, {name: $scope.info.name, delta: delta, agents: $scope.board.agents});
        $scope.$root.$broadcast('turn:move', {name: $scope.info.name, delta: delta});
      }
    };

    $scope.moveFileTo = function (loc) {
      // TODO: Do a check that no agent is in this location!
      if ($scope.board.state === state.MOVE_FILE) {
        if (loc === $scope.board.file) {
          $scope.setHelp('The safe cannot stay where it is...');
        } else if ($scope.board.locations[loc].agents.length) {
          $scope.setHelp('Please put the safe in an empty location.');
        } else {
          $scope.sendMessage(events.moveFile, {position: loc}, true);
        }
      }
    };

    $scope.boardState = function () {
      var s = boardStates[$scope.board.state];
      return [s];
    };

    $scope.locState = function (index) {
      var classes = [];
      classes.push('location-' + index);
      if (index === $scope.board.file) {
        classes.push('has-file');
      }
      if ($scope.board.locations[index].agents.length === 0) {
        classes.push('empty');
      }
      return classes;
    };

    $scope.tileState = function (index) {
      var classes = [];
      classes.push('track-' + index);
      if ($scope.board.track[index].counters.length > 4) {
        classes.push('many');
      }
      return classes;
    };

    // GAME FLOW LOGIC --------------------------------------

    $scope.doEndMovingCheck = function () {
      var winners;
      if (!$scope.isMaster()) {
        return;
      }
      if ($scope.isAgentOnFile()) {
        $scope.tally();
        $scope.sendMessage(events.tally, {counters: $scope.board.counters}, true);
        winners = $scope.haveAgentsFinished();
        if (winners.length) {
          $scope.sendMessage(events.gameOver, {winners: winners}, true);
        }
      } else {
        $scope.$root.$broadcast('turn:all:end');
      }
    };

    // INTERNAL EVENT HANDLERS ------------------------------

    $scope.$on('turn:moving:end', function () {
      $scope.doEndMovingCheck();
    });

  };
  boardController.$inject = ['$scope'];
  boardController.ctrlName = 'BoardController';

  return boardController;
});