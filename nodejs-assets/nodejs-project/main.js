var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var frontend = require('rn-bridge')
var Cabal = require('cabal-core')
var cabalSwarm = require('cabal-core/swarm.js')
var collect = require('collect-stream')
var crypto = require('hypercore-crypto')

const MAX_FEEDS = 1000
const MAX_MESSAGES = 100

var cabal

frontend.channel.send(
  JSON.stringify({ type: 'init', text: 'Node was initialized.' })
)

frontend.channel.on('message', raw => {
  var msg = JSON.parse(raw)
  if (msg.type === 'join') return startOrJoin(msg.key, msg.nick)
  if (msg.type === 'enter') return loadChannel(msg.channel)
  if (msg.type === 'exit') return exitChannel(msg.channel)
  if (msg.type === 'publish') return publish(msg)
  if (msg.type === 'nick') return publishNick(msg.nick)
})

function startOrJoin (key, nick) {
  if (!key) {
    key = crypto.keyPair().publicKey.toString('hex')
  }
  var dbPath = process.env.DB_PATH ? process.env.DB_PATH
    : path.resolve(__dirname, '..', 'db')
  var dir = path.resolve(dbPath, key)
  cabal = Cabal(dir, key, { maxFeeds: MAX_FEEDS })
  cabal.client = {
    channel: 'default',
    channels: [],
    messages: [],
    user: { online: true, key: '' },
    users: {}
  }
  cabal.db.ready(function () {
    publishNick(nick)
    const key = cabal.key.toString('hex')
    frontend.channel.send(JSON.stringify({ type: 'ready', key }))
    cabalSwarm(cabal)
    cabal.channels.get((err, channels) => {
      if (err) return
      cabal.client.channels = channels
      sendChannels(cabal.client.channels)
      loadChannel(cabal.client.channel)

      cabal.channels.events.on('add', (channel) => {
        cabal.client.channels.push(channel)
        cabal.client.channels.sort()
        sendChannels(cabal.client.channels)
      })
    })
  })
}

function publishNick (nick) {
  if (!cabal) return
  cabal.publishNick(nick)
}

function sendChannels (channels) {
  frontend.channel.send(JSON.stringify({ type: 'channels', channels }))
}

function sendMessages (err, msgs) {
  if (err) return console.error(err)
  const messages = msgs.map(msg => ({
    _id: `${msg.key}.${msg.seq}.${msg.value.timestamp}`,
    author: msg.value.author,
    authorId: msg.key,
    type: msg.value.type,
    createdAt: msg.value.timestamp,
    channel: msg.value.content.channel,
    text: msg.value.content.text
  }))
  frontend.channel.send(JSON.stringify({ type: 'messages', messages }))
}

function sendUsers (users) {
  frontend.channel.send(JSON.stringify({ type: 'users', users }))
}

function loadChannel (channel) {
  if (!cabal) return
  if (cabal.client.msgListener) {
    cabal.messages.events.removeListener(cabal.client.channel, cabal.client.msgListener)
    cabal.client.msgListener = null
  }

  cabal.client.channel = channel
  cabal.client.messages = []

  var pending = 0
  function onMessage (msg) {
    if (!cabal && !cabal.client) return
    if (pending > 0) {
      pending++
      return
    }
    pending = 1

    var rs = cabal.messages.read(channel, { limit: MAX_MESSAGES, lt: '~' })
    collect(rs, function (err, msgs) {
      if (err) return
      msgs.reverse()

      cabal.client.messages = msgs
      sendMessages(err, cabal.client.messages)

      if (pending > 1) {
        pending = 0
        onMessage()
      } else {
        pending = 0
      }
    })
  }

  cabal.messages.events.on(channel, onMessage)
  cabal.client.msgListener = onMessage
  onMessage()

  cabal.users.getAll(function (err, users) {
    if (err) return
    cabal.client.users = users

    updateLocalKey()

    cabal.users.events.on('update', function (key) {
      // TODO: rate-limit
      cabal.users.get(key, function (err, user) {
        if (err) return
        cabal.client.users[key] = Object.assign(cabal.client.users[key] || {}, user)
        if (cabal.client.user && key === cabal.client.user.key) cabal.client.user = cabal.client.users[key]
        if (!cabal.client.user) updateLocalKey()
        sendUsers(cabal.client.users)
      })
    })

    cabal.on('peer-added', function (key) {
      var found = false
      Object.keys(cabal.client.users).forEach(function (k) {
        if (k === key) {
          cabal.client.users[k].online = true
          found = true
        }
      })
      if (!found) {
        cabal.client.users[key] = {
          key: key,
          online: true
        }
      }
      sendUsers(cabal.client.users)
    })
    cabal.on('peer-dropped', function (key) {
      Object.keys(cabal.client.users).forEach(function (k) {
        if (k === key) {
          cabal.client.users[k].online = false
          sendUsers(cabal.client.users)
        }
      })
    })

    function updateLocalKey () {
      cabal.getLocalKey(function (err, lkey) {
        // set local key for local user
        cabal.client.user.key = lkey
        if (err) return sendUsers(cabal.client.users)
        // try to get more data for user
        Object.keys(users).forEach(function (key) {
          if (key === lkey) {
            cabal.client.user = users[key]
            cabal.client.user.local = true
            cabal.client.user.online = true
          }
        })
        sendUsers(cabal.client.users)
      })
    }
  })
}

function exitChannel (channel) {
  // TODO
  // if (!cabal) return
  // cabal.leaveChannel(channel)
}

function publish ({ channel, text, messageType }) {
  if (!cabal) return
  cabal.publish({
    type: messageType || 'chat/text',
    content: {
      channel,
      text
    }
  })
}
