var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var frontend = require('rn-bridge')
var Cabal = require('cabal-core')
var cabalSwarm = require('cabal-core/swarm.js')

var cabal

frontend.channel.send(
  JSON.stringify({type: 'init', text: 'Node was initialized.'})
)

frontend.channel.on('message', raw => {
  var msg = JSON.parse(raw)
  if (msg.type === 'join') return startOrJoin(msg.key, msg.nick)
  if (msg.type === 'enter') return enterChannel(msg.channel)
  if (msg.type === 'exit') return exitChannel(msg.channel)
  if (msg.type === 'publish') return publish(msg.channel, msg.text, msg.nick)
})

function startOrJoin (key, nick) {
  var starting = !key
  var dbPath = process.env.DB_PATH ? process.env.DB_PATH
    : path.resolve(__dirname, '..', 'db')
  var dir = path.resolve(dbPath, starting ? 'myinstance' : key)
  if (starting && fs.existsSync(dir)) rimraf.sync(dir)
  cabal = Cabal(dir, starting ? null : key, {username: nick})
  cabal.db.on('ready', function () {
    if (starting) cabal.joinChannel('default')
    const key = cabal.db.key.toString('hex')
    frontend.channel.send(JSON.stringify({type: 'ready', key}))
    cabalSwarm(cabal)
    cabal.getChannels(sendChannels)
  })
}

function sendChannels (err, channels) {
  if (err) return console.error(err)
  if (cabal) {
    cabal.channels.forEach(c => {
      if (channels.indexOf(c) === -1) channels.push(c)
    })
  }
  frontend.channel.send(JSON.stringify({type: 'channels', channels}))
}

function sendMessages (err, msgs) {
  if (err) return console.error(err)
  const payload = msgs.filter(msg => msg.length > 0).map(msg => ({
    _id: `${msg[0].feed}.${msg[0].seq}`,
    author: msg[0].value.author,
    authorId: msg[0].feed,
    type: msg[0].value.type,
    createdAt: msg[0].value.time,
    text: msg[0].value.content
  }))
  frontend.channel.send(JSON.stringify({type: 'many', payload}))
}

function enterChannel (channel) {
  if (!cabal) return
  cabal.joinChannel(channel)
  cabal.getMessages(channel, 100, (err, msgs) => {
    sendMessages(err, msgs)
    cabal.watch(channel, () => {
      cabal.getMessages(channel, 1, sendMessages)
    })
  })
}

function exitChannel (channel) {
  if (!cabal) return
  cabal.leaveChannel(channel)
}

function publish (channel, text, nick) {
  if (!cabal) return
  cabal.message(channel, text, {username: nick, type: 'chat/text'})
}
