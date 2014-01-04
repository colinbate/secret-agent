define([], function () {
  'use strict';

  return {
    setupNewGame: 'setupNewGame',
    newGame: 'newGame',
    gameCreated: 'gameCreated',
    needToJoin: 'needToJoin',
    cannotCreate: 'cannotCreate',
    cannotJoin: 'cannotJoin',
    hello: 'hello',
    identify: 'identify',
    join: 'join',
    left: 'left',
    promote: 'promote',
    startGame: 'startGame',
    rollDie: 'rollDie',
    rolledDie: 'rolledDie',
    moveAgent: 'moveAgent',
    tally: 'tally',
    moveFile: 'moveFile',
    newTurn: 'newTurn',
    gameOver: 'gameOver',
    revealSelf: 'revealSelf',
    chat: 'chat',
    onMessage: function (evt, $scope, fn) {
      $scope.$on(evt, function (e, msg) {
        $scope.$apply(function () {
          fn.call($scope, msg);
        });
      });
    }
  };
});