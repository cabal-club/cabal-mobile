var bridge = require('rn-bridge');
var Cabal = require('cabal-node');
var cabalSwarm = require('cabal-node/swarm.js');
var path = require('path');
var toPull = require('stream-to-pull-stream');
var pull = require('pull-stream');

// Echo every message received from react-native.
bridge.channel.on('message', msg => {
  bridge.channel.send(msg);
});

// Inform react-native node is initialized.
bridge.channel.send(
  JSON.stringify({type: 'system', text: 'Node was initialized.'}),
);

const key = '5869c063aad96aecbe36d0b0df452ba5da8907b9a52d8b680a9600f1b90a86ed';
const db = path.resolve(__dirname, '..', 'db', key);

var cabal = Cabal(db, key, {username: 'mobile'});
cabal.db.on('ready', function() {
  bridge.channel.send(
    JSON.stringify({type: 'system', text: 'Connected to the swarm'}),
  );
  cabalSwarm(cabal);
  cabal.joinChannel('default');
  pull(
    toPull.source(cabal.createReadStream('default')),
    pull.drain(msgs => {
      msgs.forEach(msg => {
        const payload = {
          type: msg.value.type,
          author: msg.value.author,
          createdAt: msg.value.time,
          text: msg.value.content,
        };
        console.warn(payload);
        bridge.channel.send(JSON.stringify(payload));
      });
    }),
  );
});
