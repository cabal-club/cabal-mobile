// @flow
import "core-js/es/reflect";
import ky from "ky";
import nodejs from "nodejs-mobile-react-native";
import RNFS from "react-native-fs";
import debug from "debug";

import { Preset, Field } from "./context/PresetsContext";
import { promiseTimeout } from "./lib/utils";
import bugsnag from "./lib/logger";
import STATUS from "./../backend/constants";

export { STATUS as Constants };

const BASE_URL = "http://127.0.0.1:9081/";
// Timeout between heartbeats from the server. If 10 seconds pass without a
// heartbeat then we consider the server has errored
const DEFAULT_TIMEOUT = 10000; // 10 seconds
// Timeout for server start. If 20 seconds passes after server starts with no
// heartbeat then we consider the server has errored
const SERVER_START_TIMEOUT = 20000;

export function Api({
  baseUrl,
  timeout = DEFAULT_TIMEOUT
}) {
  let status = STATUS.STARTING;
  let timeoutId;
  // We append this to requests for presets and map styles, in order to override
  // the local static server cache whenever the app is restarted. NB. sprite,
  // font, and map tile requests might still be cached, only changes in the map
  // style will be cache-busted.
  const startupTime = Date.now();

  const req = ky.extend({
    prefixUrl: baseUrl,
    // No timeout because indexing after first sync takes a long time, which mean
    // requests to the server take a long time
    timeout: false,
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache"
    }
  });

  const pending = [];
  let listeners = [];

  nodejs.channel.addListener("status", onStatusChange);

  function onStatusChange(newStatus) {
    status = newStatus;
    if (status === STATUS.LISTENING) {
      while (pending.length) pending.shift().resolve();
    } else if (status === STATUS.ERROR) {
      while (pending.length) pending.shift().reject(new Error("Server Error"));
    } else if (status === STATUS.TIMEOUT) {
      while (pending.length)
        pending.shift().reject(new Error("Server Timeout"));
    }
    listeners.forEach(handler => handler(status));
    if (status === STATUS.LISTENING || status === STATUS.STARTING) {
      restartTimeout();
    } else {
      clearTimeout(timeoutId);
    }
  }

  function restartTimeout() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => onStatusChange(STATUS.TIMEOUT), timeout);
  }

  // Returns a promise that resolves when the server is ready to accept a
  // request and rejects if there is an error with server startup
  function onReady() {
    return new Promise((resolve, reject) => {
      log("onReady called", status);
      if (status === STATUS.LISTENING) resolve();
      else if (status === STATUS.ERROR) reject(new Error("Server Error"));
      else if (status === STATUS.TIMEOUT) reject(new Error("Server Timeout"));
      else pending.push({ resolve, reject });
    });
  }

  // Request convenience methods that wait for the server to be ready
  function get(url) {
    return onReady().then(() => req.get(url).json());
  }
  function del(url) {
    return onReady().then(() => req.delete(url).json());
  }
  function put(url, data) {
    return onReady().then(() => req.put(url, { json: data }).json());
  }
  function post(url, data) {
    return onReady().then(() => req.post(url, { json: data }).json());
  }

  // All public methods
  const api = {
    // Start server, returns a promise that resolves when the server is ready
    // or rejects if there is an error starting the server
    startServer: function startServer {
      // The server might already be started - request current status
      nodejs.channel.post("request-status");
      nodejs.start("loader.js");
      const serverStartPromise = new Promise(resolve =>
        nodejs.channel.once("status", resolve)
      ).then(() => {
        // Start monitoring for timeout
        restartTimeout();
        // As soon as we hear from the Node process, send the storagePath so
        // that the server can start
        nodejs.channel.post("storagePath", RNFS.ExternalDirectoryPath);
        // Resolve once the server reports status as "LISTENING"
        return onReady();
      });

      serverStartPromise.then(() =>
        console.log('Backend ready!')
      );

      const serverStartTimeoutPromise = promiseTimeout(
        serverStartPromise,
        SERVER_START_TIMEOUT,
        "Server start timeout"
      );

      serverStartTimeoutPromise.catch(e => {
        // We could get here when the timeout timer has not yet started and the
        // server status is still "STARTING", so we update the status to an
        // error
        onStatusChange(STATUS.ERROR);
        bugsnag.notify(e);
      });

      return serverStartTimeoutPromise;
    },

    addServerStateListener: function addServerStateListener(
      handler: (status: ServerStatus) => any
    ): Subscription {
      listeners.push(handler);
      return {
        remove: () => (listeners = listeners.filter(h => h !== handler))
      };
    },

    /**
     * PUT and POST methods
     */

    // Stop listening for sync peers and stop advertising
    syncLeave: function syncLeave() {
      req.get("sync/leave");
    },

    // Get a list of discovered sync peers
    syncGetPeers: function syncGetPeers() {
      return get("sync/peers").then(data => data && data.message);
    },

    // Start sync with a peer
    syncStart: function syncStart(target: { host: string, port: number }) {
      return onReady().then(() => nodejs.channel.post("sync-start", target));
    },

  };

  return api;
}

export default Api({ baseUrl: BASE_URL });
