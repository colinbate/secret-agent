define([], function () {
  'use strict';

  return {
    setupNewGame: 'setupNewGame',
    newGame: 'newGame',
    gameCreated: 'gameCreated',
    masterJoin: 'masterJoin',
    needToJoin: 'needToJoin',
    cannotJoin: 'cannotJoin',
    hello: 'hello',
    identify: 'identify',
    join: 'join',
    startGame: 'startGame',
    rollDie: 'rollDie',
    rolledDie: 'rolledDie',
    moveAgent: 'moveAgent',
    tally: 'tally',
    moveFile: 'moveFile',
    newTurn: 'newTurn',
    gameOver: 'gameOver',
    revealSelf: 'revealSelf',
    onMessage: function (evt, $scope, fn) {
      $scope.$on(evt, function (e, msg) {
        $scope.$apply(function () {
          fn.call($scope, msg);
        });
      });
    }
  };
});