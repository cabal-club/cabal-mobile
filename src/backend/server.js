const path = require('path')
const rnBridge = require('rn-bridge')
const debug = require('debug')
const http = require('http')
//const Hypercore = require('hypercore')

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
  // start hypercore here
  return server
}
