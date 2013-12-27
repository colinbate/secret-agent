define([], function () {
  'use strict';

  var chatController = function ($scope) {
    $scope.messages = [];

  };
  chatController.$inject = ['$scope'];
  chatController.ctrlName = 'ChatController';

  return chatController;
});