/* eslint-env jest/globals */
import ky from "ky";
import nodejs from "nodejs-mobile-react-native";
import RNFS from "react-native-fs";
import { Api, Constants } from "./api";

// require("debug").enable("*");

jest.mock("ky");
jest.mock("nodejs-mobile-react-native");
jest.mock("react-native-fs");

describe("Server startup", () => {
  test("Initialization sets up nodejs status listener", () => {
    const spy = jest.spyOn(nodejs.channel, "addListener");
    new Api({ baseUrl: "__URL__" }); // eslint-disable-line no-new
    expect(spy).toHaveBeenCalled();
  });

  test("Start server", async () => {
    expect.assertions(5);
    nodejs.start = jest.fn();
    // This mocks the initial heartbeat from the server
    nodejs.channel.once = jest.fn((_, handler) => handler());
    // This mocks the server to immediately be in "Listening" state
    nodejs.channel.addListener = jest.fn((_, handler) =>
      handler(Constants.LISTENING)
    );
    nodejs.channel.post = jest.fn();
    const api = new Api({ baseUrl: "__URL__" });
    await expect(api.startServer()).resolves.toBeUndefined();
    expect(nodejs.start.mock.calls.length).toBe(1);
    expect(nodejs.start.mock.calls[0][0]).toBe("loader.js");
    expect(nodejs.channel.post.mock.calls.length).toBe(2);
    expect(nodejs.channel.post.mock.calls[1][1]).toBe(
      RNFS.ExternalDirectoryPath
    );
  });

  test("Start server timeout", async () => {
    jest.useFakeTimers();
    expect.assertions(4);
    nodejs.start = jest.fn();
    nodejs.channel.once = jest.fn();
    nodejs.channel.addListener = jest.fn();
    nodejs.channel.post = jest.fn();
    const api = new Api({ baseUrl: "__URL__" });
    process.nextTick(() => jest.runAllTimers());
    await expect(api.startServer()).rejects.toThrow("Server start timeout");
    expect(nodejs.start.mock.calls.length).toBe(1);
    expect(nodejs.start.mock.calls[0][0]).toBe("loader.js");
    expect(nodejs.channel.post.mock.calls.length).toBe(1);
  });
});

describe("Server status", () => {
  let subscription;
  let serverStatus;
  let stateListener;

  beforeEach(() => {
    jest.useFakeTimers();
    return startServer().then(spys => {
      subscription = spys.subscription;
      serverStatus = spys.serverStatus;
      stateListener = spys.stateListener;
    });
  });

  test("Timeout", () => {
    jest.runAllTimers();
    expect(stateListener).toHaveBeenCalledWith(Constants.TIMEOUT);
  });
  test("Timeout only happens once if no other server status message", () => {
    jest.advanceTimersByTime(10001);
    jest.advanceTimersByTime(10001);
    expect(stateListener).toHaveBeenCalledTimes(1);
    expect(stateListener).toHaveBeenNthCalledWith(1, Constants.TIMEOUT);
  });
  test("After timeout, if server starts listening, timeout starts again", () => {
    jest.advanceTimersByTime(10001);
    serverStatus(Constants.LISTENING);
    jest.advanceTimersByTime(10001);
    expect(stateListener).toHaveBeenCalledTimes(3);
    expect(stateListener).toHaveBeenNthCalledWith(1, Constants.TIMEOUT);
    expect(stateListener).toHaveBeenNthCalledWith(2, Constants.LISTENING);
    expect(stateListener).toHaveBeenNthCalledWith(3, Constants.TIMEOUT);
  });
  test("After timeout, if server is starting, timeout starts again", () => {
    jest.advanceTimersByTime(10001);
    serverStatus(Constants.STARTING);
    jest.advanceTimersByTime(10001);
    expect(stateListener).toHaveBeenCalledTimes(3);
    expect(stateListener).toHaveBeenNthCalledWith(1, Constants.TIMEOUT);
    expect(stateListener).toHaveBeenNthCalledWith(2, Constants.STARTING);
    expect(stateListener).toHaveBeenNthCalledWith(3, Constants.TIMEOUT);
  });
  test("After error, timeout will not happen", () => {
    serverStatus(Constants.ERROR);
    jest.advanceTimersByTime(10001);
    expect(stateListener).toHaveBeenCalledTimes(1);
    expect(stateListener).toHaveBeenNthCalledWith(1, Constants.ERROR);
  });
  test("After server close, timeout will not happen until it restarts", () => {
    serverStatus(Constants.CLOSED);
    jest.runAllTimers();
    serverStatus(Constants.LISTENING);
    jest.runAllTimers();
    expect(stateListener).toHaveBeenCalledTimes(3);
    expect(stateListener).toHaveBeenNthCalledWith(1, Constants.CLOSED);
    expect(stateListener).toHaveBeenNthCalledWith(2, Constants.LISTENING);
    expect(stateListener).toHaveBeenNthCalledWith(3, Constants.TIMEOUT);
  });
  test("Unsubscribe works", () => {
    subscription.remove();
    serverStatus(Constants.LISTENING);
    expect(stateListener).toHaveBeenCalledTimes(0);
  });
});

describe("Server get requests", () => {
  ky.extend.mockImplementation(() => ({
    get: jest.fn(url => ({
      json: jest.fn(() => {
        if (url.startsWith("styles")) return [];
        const data = [];
        data.presets = {};
        data.fields = {};
        return data;
      })
    }))
  }));

  ["getObservations", "getPresets", "getFields", "getMapStyle"].forEach(
    method => {
      test(method + " with server ready", async () => {
        const { api } = await startServer();
        expect.assertions(1);
        return expect(api[method]()).resolves.toEqual([]);
      });
      test(method + " doesn't resolve until server is ready", async () => {
        const { api, serverStatus } = await startServer();
        jest.useRealTimers();
        let pending = true;
        serverStatus(Constants.STARTING);
        expect.assertions(2);
        const getPromise = api[method]().finally(() => {
          pending = false;
        });
        setTimeout(() => {
          expect(pending).toBe(true);
          serverStatus(Constants.LISTENING);
        }, 200);
        return expect(getPromise).resolves.toEqual([]);
      });
      test(method + " rejects if server timeout", async () => {
        const { api, serverStatus } = await startServer();
        jest.useFakeTimers();
        serverStatus(Constants.STARTING);
        const getPromise = api[method]();
        jest.runAllTimers();
        expect.assertions(1);
        return expect(getPromise).rejects.toThrow("Server Timeout");
      });
      test(method + " rejects if server error", async () => {
        const { api, serverStatus } = await startServer();
        serverStatus(Constants.ERROR);
        const getPromise = api[method]();
        expect.assertions(1);
        return expect(getPromise).rejects.toThrow("Server Error");
      });
    }
  );
});

function startServer() {
  const stateListener = jest.fn();
  let serverStatus;
  nodejs.start = jest.fn();
  // This mocks the initial heartbeat from the server
  nodejs.channel.once = jest.fn((_, handler) => handler());
  nodejs.channel.post = jest.fn();
  nodejs.channel.addListener = jest.fn((_, handler) => {
    handler(Constants.LISTENING);
    serverStatus = handler;
  });
  const api = new Api({ baseUrl: "__URL__" });
  return api.startServer().then(() => {
    const subscription = api.addServerStateListener(stateListener);
    return {
      api,
      subscription,
      serverStatus,
      stateListener
    };
  });
}
