define(['primus'], function (Primus) {
  'use strict';

  var messagesProvider = function () {
    this.url = '';
    this.gameId = '';
    
    this.setUrl = function (url) {
      this.url = url;
    };

    this.setGameId = function (id) {
      this.gameId = id;
    };

    this.$get = function ($rootScope) {
      var self = this,
          primus,
          handleIncoming = function (data) {
            if (!data || !data.action) {
              // Ignore.
              return;
            }
            console.log('Received message: ' + data.action);
            $rootScope.$broadcast(data.action, data);
          },
          getUrl = function () {
            return self.url + '?game=' + self.gameId;
          };
      if (self.url === '') {
        self.url = '/';
      }
      return {
        send: function (action, payload, sendLocal) {
          if (!primus) {
            this.connect();
          }
          payload = payload || {};
          payload.action = action;
          console.log('Sending message: ' + action);
          primus.write(payload);
          if (sendLocal) {
            setTimeout(function () {
              console.log('Received local message: ' + action);
              $rootScope.$broadcast(action, payload);
            }, 0);
          }
        },
        connect: function (gameId) {
          if (primus) {
            if (gameId && gameId !== self.gameId) {
              primus.end();
            } else {
              return;
            }
          }
          if (gameId) {
            self.gameId = gameId;
          }
          if (!self.gameId) {
            return;
          }
          primus = new Primus(getUrl());
          primus.on('data', handleIncoming);
        },
        getGameId: function () {
          return self.gameId;
        }
      };
    };
    this.$get.$inject = ['$rootScope'];
  };

  return messagesProvider;
});