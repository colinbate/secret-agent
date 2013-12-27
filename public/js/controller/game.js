define(['game/data', 'game/events'], function (data, events) {
  'use strict';

  var gameController = function ($scope, messages) {
    $scope.info = {
      id: '',
      state: 0,
      name: '',
      role: '',
      agents: [],
    };

    $scope.getAgent = function (index) {
      if (!data.agents || data.agents.length <= index) {
        $scope.setError('Trying to access agent ' + index + ' which does not exist');
        return;
      }
      return data.agents[index]
    };

    $scope.isMaster = function () {
      return $scope.info.role === 'master';
    }

    // This starts the magic.
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