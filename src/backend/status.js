const rnBridge = require("rn-bridge");
const constants = require("./constants");

class ServerStatus {
  constructor() {
    this.setState(constants.STARTING);
    rnBridge.channel.on("request-status", () => {
      console.log("status request");
      rnBridge.channel.post("status", this.state);
    });
  }
  startHeartbeat() {
    if (this.intervalId) return; // Don't have two heartbeats
    this.intervalId = setInterval(() => {
      rnBridge.channel.post("status", this.state);
    }, 4000);
  }
  pauseHeartbeat() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
  getState() {
    return this.state;
  }
  setState(nextState) {
    if (nextState === this.state) return;
    // Once we have an uncaught error, don't try to pretend it's gone away
    if (this.state === constants.ERROR) return;
    console.log("state changed", nextState);
    this.state = nextState;
    rnBridge.channel.post("status", nextState);
  }
}

module.exports = ServerStatus;
