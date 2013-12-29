define(
    [
        'angular',
        'controller/loader',
        'game/messages'
    ],
    function (angular, ctrlLoader, messages) {
    'use strict';

    var appName = 'secretAgent',
        log = function () {
            var msg = Array.prototype.join.call(arguments, ' ');
            if (window.console) {
                window.console.log(msg);
            }
        },
        joinGameId = function () {
          var gameId, hash = window.location.href.substr(window.location.href.indexOf('#')+1);
          gameId = window.location.href === hash ? null : hash;
          return gameId;
        };
    return {
        bootstrap: function () {
            var app, gameId = joinGameId();
            log('He\'s a secret agent man...');
            app = angular.module(appName, []);
            app.provider('messages', messages);
            app.config(['messagesProvider', function (messagesProvider) {
              messagesProvider.setGameId(gameId);
            }]);
            ctrlLoader(app);
            angular.bootstrap(document, [appName]);
        }
    };
});