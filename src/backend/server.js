const path = require("path");
const rnBridge = require("rn-bridge");
const debug = require("debug");
const http = require("http");
const CabalClient = require("cabal-client");

debug("cabal/server");

module.exports = createServer;

function createServer({ privateStorage, sharedStorage }) {
  var server = http.createServer((req, res) => {
    // TODO: USE TO SERVE PROFILE PICTURES
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

  rnBridge.channel.on("cabal::addCabal", key => {
    debug("addCabal", key);
    client.addCabal(key).then(cabalDetails => {
      rnBridge.channel.send("cabal::render", key);
    });
  });

  return server;
}
