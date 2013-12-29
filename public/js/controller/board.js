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
        };

    $scope.board = {
      file: 7,
      counters: [],
      agents: [],
      locations: data.locations,
      state: state.WAIT
    };

    // INTERNAL STATE MANAGEMENT ----------------------------

    $scope.moveAgentDelta = function (delta) {
      var ii;
      for (ii = 0; ii < $scope.board.agents.length; ii += 1) {
        if ($scope.board.agents[ii][0] === delta[0]) {
          $scope.board.agents[ii][1] = ($scope.board.agents[ii][1] + delta[1]) % $scope.locationCount();
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
        $scope.board.counters[ii][1] += pts;
        if ($scope.board.counters[ii][1] < 0) {
          $scope.board.counters[ii][1] = 0;
        }
      }
    };

    $scope.setCounters = function (counters) {
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
      for (aidx = 0; aidx < alen; aidx += 1) {
        $scope.board.counters.push(getMarker(msg.agents[aidx]));
        $scope.board.agents.push(getMarker(msg.agents[aidx]));
      }
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
      if (!winners.length && $scope.board.state === state.MOVE_AGENTS) {
        // Need to move file.
        $scope.board.state = state.MOVE_FILE;
      }
    };

    events.onMessage(events.startGame, $scope, $scope.handleStartGame);
    events.onMessage(events.newTurn, $scope, $scope.handleNewTurn);
    events.onMessage(events.rolledDie, $scope, $scope.handleRolledDie);
    events.onMessage(events.moveAgent, $scope, $scope.handleMoveAgent);
    events.onMessage(events.moveFile, $scope, $scope.handleMoveFile);
    events.onMessage(events.tally, $scope, $scope.handleTally);

    // UI GAME INTERACTION ----------------------------------

    $scope.moveAgent = function (agent, steps) {
      var delta = [agent, steps];
      $scope.moveAgentDelta(delta);
      $scope.sendMessage(events.moveAgent, {name: $scope.info.name, delta: delta, agents: $scope.board.agents});
      $scope.$root.$broadcast('turn:move', delta);
    };

    $scope.moveFileTo = function (loc) {
      // TODO: Do a check that no agent is in this location!
      if (loc !== $scope.board.file && $scope.board.state === state.MOVE_FILE) {
        $scope.sendMessage(events.moveFile, {position: loc}, true);
      }
    };

    $scope.boardState = function () {
      var s = boardStates[$scope.board.state];
      return [s];
    };

    $scope.locState = function (index) {
      var classes = [];
      if (index === $scope.board.file) {
        classes.push('has-file');
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