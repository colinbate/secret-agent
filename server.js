'use strict';
process.chdir(__dirname);
var Primus = require('primus'),
    Rooms = require('primus-rooms'),
    http = require('http'),
    nodestatic = require('node-static'),
    uuid = require('uuid'),
    file = new nodestatic.Server('./public', {cache: false}),
    server = http.createServer(function (request, response) {
      request.addListener('end', function () {
          file.serve(request, response);
      }).resume();
    }),
    primus = new Primus(server, {
      transformer: 'socket.io'
    }),
    interceptors = {
      hello: function (msg, spark, game) {
        if (game) {
          primus.room(game + '-master').write(msg);
        }
      },
      masterJoin: function (msg, spark, game) {
        if (!spark.isRoomEmpty(game)) {
          spark.write({action:'cannotJoin', reason: 'already exists'});
          return;
        }
        
        spark.join(game);
        spark.join(game + '-master');
      },
      startGame: function (msg, spark, game) {
        
      },
      rollDie: function (msg, spark, game) {

      }
    },
    createGame = function (spark) {
      spark.on('data', function (message) {
        var gameId;
        if (message && message.action === 'newGame') {
          gameId = uuid.v4();
          while (!spark.isRoomEmpty(gameId)) {
            gameId = uuid.v4();
          }
          spark.write({action:'gameCreated', id: gameId});
        }
      });
    };

primus.use('rooms', Rooms);

primus.on('connection', function (spark) {
  var game = spark.query && spark.query.game;
  if (!game) {
    // Pre game connection
    console.log('Pre-game connection made');
    createGame(spark);
    return;
  }
  console.log(spark.id + ' connected to ' + game);
  spark.on('data', function (message) {
    var send = function () {
          spark.room(game).write(message);
        };

    if (message && interceptors[message.action]) {
      interceptors[message.action].call(null, message, spark, game);
      return;
    }
    // check if spark is already in this room
    if (~spark.rooms().indexOf(game)) {
      send();
    } else {
      // join the room
      spark.join(game, function () {
        send();
      });
    }
  })
});

primus.on('disconnection', function (spark) {
  var game = spark.query && spark.query.game;
  console.log(spark.id + ' disconnected from ' + game);
});

server.listen(9000);