const path = require('path')
const rnBridge = require('rn-bridge')
const debug = require('debug')
const http = require('http')
//const CoboxServer = require('@coboxcoop/mono/src/server')
//const constants = require('@coboxcoop/mono/src/constants')

module.exports = createServer

function createServer ({ privateStorage, sharedStorage }) {
  var server = http.createServer((req, res) => {
    console.log(req.url)
    res.end('OK')
  })

  var opts = {
    hostname: 'localhost',
    port: 9112,
    storage: path.join(privateStorage, '.cobox')
  }
  // The main db for p2p data
  //const app = CoboxServer(opts)

  /*
  //app.start((err) => {
    if (err) {
      debug('failed to start the app properly')
      throw err
    }
  })
  */
  return server
}
