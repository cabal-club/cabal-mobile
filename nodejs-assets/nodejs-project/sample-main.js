// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.

var rnBridge = require('rn-bridge')

// Echo every message received from react-native.
rnBridge.channel.on('message', (msg) => {
  rnBridge.channel.send(msg)
})

// Inform react-native node is initialized.
rnBridge.channel.send('Node was initialized.')
