'use strict';
process.chdir(__dirname);
var Primus = require('primus'),
    Rooms = require('primus-rooms'),
    http = require('http'),
    nodestatic = require('node-static'),
    file = new nodestatic.Server('./public', {cache: false}),
    server = http.createServer(function (request, response) {
      request.addListener('end', function () {
          file.serve(request, response);
      }).resume();
    }),
    primus = new Primus(server, {
      transformer: 'socket.io'
    });

primus.use('rooms', Rooms);

primus.on('connection', function (spark) {
  var game = spark.query && spark.query.game;
  if (!game) {
    spark.end();
    return;
  }
  console.log(spark.id + ' connected to ' + game);
  spark.on('data', function (message) {
    var send = function () {
          spark.room(game).write(message);
        };

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