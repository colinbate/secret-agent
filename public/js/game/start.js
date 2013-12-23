define(['primus'], function (Primus) {
  'use strict';
  var primus,
      secretAgent,
      addPlayer = function (name) {
        var list = document.getElementById('player-list'),
            li = document.createElement('li');
        li.appendChild(document.createTextNode(name));
        list.appendChild(li);
      };

  secretAgent = window.SecretAgent = window.SecretAgent || {};
  secretAgent.player = 'Player-' + Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  return {
    bootstrap: function () {
      console.log('He\'s a secret agent man...');
      primus = new Primus('/?game=mygame');
      secretAgent.comms = primus;
      addPlayer(secretAgent.player);
      primus.on('data', function (data) {
        console.log('Primus:', data);

        if (data.action === 'join') {
          primus.write({action: 'ident', player: secretAgent.player});
          addPlayer(data.player);
        } else if (data.action === 'ident') {
          addPlayer(data.player);
        }
      });
      primus.write({action: 'join', player: secretAgent.player});
    }
  };
});