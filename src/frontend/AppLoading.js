import * as React from "react";
import SplashScreen from "react-native-splash-screen";
import debug from "debug";

import ServerStatusScreen from "./ServerStatus"
import api, { Constants } from "./api";

const log = debug("AppLoading");

/**
 * Listens to the nodejs-mobile process and only renders children when the
 * server is up and running and listening.
 * On initial app load it waits for the server before dismissing the native
 * splash screen.
 * If it doesn't hear a heartbeat message for timeout, it displays a screen to
 * the user so they know something is wrong.
 */
class AppLoading extends React.Component {
  _timeoutId;
  _subscription: { remove: () => any };
  state = {
    serverStatus: null
  };

  componentDidMount() {
    this._timeoutId = setTimeout(() => {
      SplashScreen.hide();
      this._timeoutId = null;
      log("hiding splashscreen");
    }, 1000);
    log('adding listener', this.handleStatusChange)
    this._subscription = api.addServerStateListener(this.handleStatusChange);
  }

  componentDidUpdate() {
    if (this.state.serverStatus == null) {
      log('starting server')
      api.startServer();
      this.setState({ serverStatus: Constants.STARTING });
    }
  }

  componentWillUnmount() {
    this._subscription.remove();
    if (!this._timeoutId) return;
    clearTimeout(this._timeoutId);
    SplashScreen.hide();
  }

  handleStatusChange = (serverStatus) => {
    log('handleStatusChange', serverStatus)
    if (serverStatus === this.state.serverStatus) return;
    log("status change", serverStatus);
    this.setState({ serverStatus });
  };

  render() {
    const { serverStatus } = this.state;
    log('server status', serverStatus)
    if (serverStatus === Constants.ERROR) {
      return <ServerStatusScreen variant="error" />;
    } else if (serverStatus === Constants.TIMEOUT) {
      return <ServerStatusScreen variant="timeout" />;
    } else {
      return this.props.children;
    }
  }
}

export default AppLoading;
