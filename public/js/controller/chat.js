define(['game/events'], function (events) {
  'use strict';

  var chatController = function ($scope) {
    var states = ['closed', 'open'],
        state = {CLOSED: 0, OPEN: 1};

    $scope.messages = [];
    $scope.inputMessage = '';
    $scope.state = 0;

    // GAME UI INTERACTION ----------------------------------

    $scope.submitCheck = function (ev) {
      if (ev && ev.keyCode) {
        if (ev.keyCode === 13) {
          if ($scope.inputMessage.length > 0) {
            $scope.sendChatMessage();
          }
        } else if (ev.keyCode === 27) {
          $scope.closeChat();
        }
      }
    };

    $scope.sendChatMessage = function () {
      var payload = {name: $scope.info.name, msg: $scope.inputMessage};
      $scope.addMessage(payload);
      $scope.inputMessage = '';
      $scope.sendMessage(events.chat, payload);
    };

    $scope.chatState = function () {
      var classes = [];
      classes.push(states[$scope.state]);
      return classes;
    };

    // INTERNAL STATE MANAGEMENT ----------------------------

    $scope.addMessage = function (payload) {
      $scope.messages.push(payload);
    };

    $scope.openChat = function () {
      $scope.state = state.OPEN;
      $scope.startChat = true;
      $scope.game.newChatMessages = false;
    };

    $scope.closeChat = function () {
      $scope.state = state.CLOSED;
    };

    // EVENT HANDLERS ---------------------------------------

    $scope.$on('chat:open', function () {
      $scope.openChat();
    });

    $scope.$on('chat:close', function () {
      $scope.closeChat();
    });

    // MESSAGE HANDLERS -------------------------------------

    $scope.handleChat = function (msg) {
      $scope.addMessage(msg);
      if ($scope.state !== state.OPEN) {
        $scope.game.newChatMessages = true;
      }
    };

    events.onMessage(events.chat, $scope, $scope.handleChat);


  };
  chatController.$inject = ['$scope'];
  chatController.ctrlName = 'ChatController';

  return chatController;
});