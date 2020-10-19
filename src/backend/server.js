const path = require("path");
const rnBridge = require("rn-bridge");
const debug = require("debug");
const http = require("http");
const CabalClient = require("cabal-client");

module.exports = createServer;

function createServer({ privateStorage, sharedStorage }) {
  var server = http.createServer((req, res) => {
    console.log(req.url);
    res.end("OK");
  });

  var opts = {
    hostname: "localhost",
    port: 9112,
    storage: path.join(privateStorage, ".cabal")
  };

  const client = new CabalClient({
    config: {
      dbdir: opts.storage
    }
  });

  client.createCabal().then(cabal => {
    // resolves when the cabal is ready, returns a CabalDetails instance
  });

  return server;
}
