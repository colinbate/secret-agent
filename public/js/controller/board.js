define([], function () {
  'use strict';

  var boardController = function ($scope) {
    $scope.board = {
      file: 7,
      counters: [],
      agents: []
    };

  };
  boardController.$inject = ['$scope'];
  boardController.ctrlName = 'BoardController';

  return boardController;
});