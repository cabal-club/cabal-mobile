const rnBridge = require("rn-bridge");

const constants = require("./constants");
const ServerStatus = require("./status");
const createServer = require("./server");
const semver = require("semver");
const { version } = require("../../package.json");
const debug = require("debug");
debug.enable("cabal*");

const prereleaseComponents = semver.prerelease(version);
const releaseStage = prereleaseComponents
  ? prereleaseComponents[0]
  : "production";

const log = console.log;
const PORT = 9112;
const status = new ServerStatus();
let paused = false;
let storagePath;
let server;

status.startHeartbeat();

/**
 * 'External Storage' on Android does not actually mean an external SD
 * card. It is a shared folder that the user can access. The data folder
 * accessible through rnBridge.app.datadir() is not accessible by the user.
 *
 * We need to wait for the React Native process to tell us where the folder is.
 * This code supports re-starting the server with a different folder if
 * necessary (we probably shouldn't do that)
 */
rnBridge.channel.on("storagePath", path => {
  log("storagePath", path);
  if (path === storagePath) return;
  const prevStoragePath = storagePath;
  if (server) {
    server.close(() => {
      log("closed server with storagePath", prevStoragePath);
    });
  }
  storagePath = path;
  try {
    server = createServer({
      privateStorage: rnBridge.app.datadir(),
      sharedStorage: storagePath
    });
  } catch (e) {}
  if (!paused) startServer();
});

/**
 * Close the server and pause heartbeat when in background
 * We need to do this because otherwise Android/iOS may shutdown the node
 * process when it sees it is doing things in the background
 */
rnBridge.app.on("pause", pauseLock => {
  paused = true;
  status.pauseHeartbeat();
  stopServer(() => pauseLock.release());
});

// Start things up again when app is back in foreground
rnBridge.app.on("resume", () => {
  // When the RN app requests permissions from the user it causes a resume event
  // but no pause event. We don't need to start the server if it's already
  // listening (because it wasn't paused)
  // https://github.com/janeasystems/nodejs-mobile/issues/177
  if (!paused) return;
  paused = false;
  status.setState(constants.STARTING);
  status.startHeartbeat();
  startServer();
});

function startServer(cb) {
  log("starting server");
  if (!server) return;
  server.listen(PORT, () => {
    log("listening");
    status.setState(constants.LISTENING);
  });
}

function stopServer(cb) {
  if (!server) return;
  status.setState(constants.CLOSING);
  server.close(() => {
    status.setState(constants.CLOSED);
    cb();
  });
}
