define(['primus', 'game/events'], function (Primus, events) {
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
          reconnect = function (gameId) {
            if (primus) {
              primus.end();
            }
            console.log('Reconnecting to WS with game id: ' + gameId);
            primus = new Primus(getUrl(gameId));
            primus.on('data', handleIncoming);
          },
          handleIncoming = function (data) {
            if (!data || !data.action) {
              // Ignore.
              return;
            }
            if (data.action === events.gameCreated) {
              // Reconnect with game info
              reconnect(data.id);
            }
            console.log('Received message: ' + data.action);
            $rootScope.$broadcast(data.action, data);
          },
          getUrl = function (gameId) {
            self.gameId = (gameId = gameId || self.gameId);
            return self.url + (gameId ? '?game=' + gameId : '');
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
          primus = new Primus(getUrl(gameId));
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