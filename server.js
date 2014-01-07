/*jshint node:true */
'use strict';
process.chdir(__dirname);
var Primus = require('primus'),
    Rooms = require('primus-rooms'),
    http = require('http'),
    nodestatic = require('node-static'),
    selfHost = process.argv.length > 2 && process.argv[2] === 'selfhost',
    genlib = process.argv.length > 2 && process.argv[2] === 'genlib',
    file = selfHost ? new nodestatic.Server('./public', {cache: false, headers: {'Cache-Control': 'no-cache, must-revalidate'}}) : null,
    server = selfHost ? http.createServer(function (request, response) {
      request.addListener('end', function () {
          file.serve(request, response);
      }).resume();
    }) : http.createServer(),
    primus = new Primus(server, {
      transformer: 'socket.io'
    }),
    randomInt = function (max, min) {
      return parseInt(Math.floor(Math.random() * (max - min + 1) + min), 10);
    },
    sendDirect = function (msg, spark, game) {
      var socket;
      if (game && msg.dest) {
        socket = primus.connections[msg.dest];
        if (socket) {
          socket.write(msg);
        }
      }
    },
    interceptors = {
      newGame: function (msg, spark, game) {
          if (!spark.isRoomEmpty(game)) {
            spark.write({action:'cannotCreate', reason: 'already exists'});
            return;
          }
          spark.join(game);
          spark.join(game + '-master');
          spark.write({action:'gameCreated', id: game, pid: spark.id});
      },
      hello: function (msg, spark, game) {
        if (game) {
          msg.source = spark.id;
          primus.room(game + '-master').write(msg);
          //console.log('Said hello to room: ' + game + '-master');
        }
      },
      identify: sendDirect,
      cannotJoin: sendDirect,
      startGame: function (msg, spark, game) {
        var players = msg.players,
            playerCount = players.length,
            toRemove = Math.max(0, (7 - (msg.opts.extraAgents || 2)) - players.length), remInd,
            agents = [0,1,2,3,4,5,6],
            pool;
        players.sort(function () { return 0.5 - Math.random(); });
        while (toRemove) {
          remInd = randomInt(agents.length - 1, 0);
          agents.splice(remInd, 1);
          toRemove -= 1;
        }
        pool = agents.concat(); // clone

        spark.room(game).clients(function (err, list) {
          var idx, agent, aIdx, payload, socket;
          //console.log('Found ' + list.length + ' connected clients.');
          list.reverse();
          if (list.length > playerCount) {
            // Too many clients vs players.
            console.error('There are too many clients (' + list.length + ') vs players (' + playerCount + ') in game ' + game);
            list.splice(playerCount, list.length - playerCount);
          }
          for (idx = 0; idx < list.length; idx += 1) {
            //console.log('Client id: ' + list[idx]);
            aIdx = randomInt(pool.length - 1, 0);
            agent = pool[aIdx];
            pool.splice(aIdx, 1);
            payload = {action:'startGame', playOrder: players, opts: msg.opts, agents: agents, you: agent};
            socket = primus.connections[list[idx]];
            if (socket) {
              socket.write.call(socket, 'ignore');
              //console.log('Sending to ' + socket.id + ':');
              //console.log(require('util').inspect(payload));
              socket.write.call(socket, payload);
            } else {
              console.error('No socket for ' + list[idx]);
            }
          }
        });
      },
      rollDie: function (msg, spark, game) {
        var value = randomInt(6, 1),
            payload = {action: 'rolledDie', name: msg.name, value: value};
        spark.write(payload);
        spark.room(game).write(payload);
      }
    };

primus.use('rooms', Rooms);
primus.save(__dirname + '/public/lib/primus.js');

if (genlib) {
  // Quit now
  process.exit(0);
}

primus.on('connection', function (spark) {
  var game = spark.query && spark.query.game;
  if (!game) {
    // Invalid connection
    console.warn('Someone connecting without a game.');
    process.nextTick(function () {
      spark.end();
    });
    return;
  }
  console.log(spark.id + ' connected to ' + game);
  spark.on('data', function (message) {
    var send = function () {
          spark.room(game).write(message);
        };
    console.log('Received message on server: ' + message.action + ' from ' + spark.id);
    if (message && interceptors[message.action]) {
      interceptors[message.action].call(null, message, spark, game);
      return;
    }
    if (message && message.action === 'join') {
      message.id = spark.id;
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
  });
});

primus.on('disconnection', function (spark) {
  var game = spark.query && spark.query.game;
  if (game) {
    spark.room(game).write({action:'left', id: spark.id});
    spark.leave(game);
  }
});

server.listen(9000);