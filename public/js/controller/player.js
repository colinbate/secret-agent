define([], function () {
  'use strict';

  var playerController = function ($scope) {
    $scope.players = {
      list: [],
      current: {}
    };

  };
  playerController.$inject = ['$scope'];
  playerController.ctrlName = 'PlayerController';

  return playerController;
});