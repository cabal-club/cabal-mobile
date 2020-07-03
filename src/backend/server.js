const path = require('path')
const rnBridge = require('rn-bridge')
const debug = require('debug')
//const CoboxServer = require('@coboxcoop/mono/src/server')
//const constants = require('@coboxcoop/mono/src/constants')

module.exports = createServer

function createServer ({ privateStorage, sharedStorage }) {
  // The main db for p2p data
  var opts = {
    hostname: 'localhost',
    port: 9112,
    storage: path.join(privateStorage, '.cobox')
  }
  //const app = CoboxServer(opts)

  /*
  //app.start((err) => {
    if (err) {
      debug('failed to start the app properly')
      throw err
    }
  })
  */
  rnBridge.channel.post('app-start', opts.port)

  return
}
