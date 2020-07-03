// @flow
import 'core-js/es/reflect'
import ky from 'ky'
import nodejs from 'nodejs-mobile-react-native'
import RNFS from 'react-native-fs'
import debug from 'debug'

const log = debug('frontend/api')

import { promiseTimeout } from './lib/utils'
import STATUS from './../backend/constants'

export { STATUS as Constants }

const BASE_URL = 'http://127.0.0.1:9112/'
// Timeout between heartbeats from the server. If 10 seconds pass without a
// heartbeat then we consider the server has errored
const DEFAULT_TIMEOUT = 10000 // 10 seconds
// Timeout for server start. If 20 seconds passes after server starts with no
// heartbeat then we consider the server has errored
const SERVER_START_TIMEOUT = 20000

export function Api({
  baseUrl,
  timeout = DEFAULT_TIMEOUT
}) {
  let status = STATUS.STARTING
  let timeoutId

  const req = ky.extend({
    prefixUrl: baseUrl,
    // No timeout because indexing after first sync takes a long time, which mean
    // requests to the server take a long time
    timeout: false,
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache'
    }
  })

  const pending = []
  let listeners = []

  nodejs.channel.addListener('status', onStatusChange)

  function onStatusChange(newStatus) {
    status = newStatus
    if (status === STATUS.LISTENING) {
      while (pending.length) pending.shift().resolve()
    } else if (status === STATUS.ERROR) {
      while (pending.length) pending.shift().reject(new Error('Server Error'))
    } else if (status === STATUS.TIMEOUT) {
      while (pending.length)
        pending.shift().reject(new Error('Server Timeout'))
    }
    listeners.forEach(handler => handler(status))
    if (status === STATUS.LISTENING || status === STATUS.STARTING) {
      restartTimeout()
    } else {
      clearTimeout(timeoutId)
    }
  }

  function restartTimeout() {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => onStatusChange(STATUS.TIMEOUT), timeout)
  }

  // Returns a promise that resolves when the server is ready to accept a
  // request and rejects if there is an error with server startup
  function onReady() {
    return new Promise((resolve, reject) => {
      log('onReady called', status)
      if (status === STATUS.LISTENING) resolve()
      else if (status === STATUS.ERROR) reject(new Error('Server Error'))
      else if (status === STATUS.TIMEOUT) reject(new Error('Server Timeout'))
      else pending.push({ resolve, reject })
    })
  }

  // Request convenience methods that wait for the server to be ready
  function get(url) {
    return onReady().then(() => req.get(url).json())
  }
  function del(url) {
    return onReady().then(() => req.delete(url).json())
  }
  function put(url, data) {
    return onReady().then(() => req.put(url, { json: data }).json())
  }
  function post(url, data) {
    return onReady().then(() => req.post(url, { json: data }).json())
  }

  // All public methods
  const api = {
    // Start server, returns a promise that resolves when the server is ready
    // or rejects if there is an error starting the server
    startServer: function () {
      // The server might already be started - request current status
      log('requesting status')
      nodejs.channel.post('request-status')
      nodejs.start('loader.js')
      const serverStartPromise = new Promise(resolve => {
        nodejs.channel.once('status', resolve)
        log('got status')
      }).then(() => {
        // Start monitoring for timeout
        restartTimeout()
        // As soon as we hear from the Node process, send the storagePath so
        // that the server can start
        nodejs.channel.post('storagePath', RNFS.ExternalDirectoryPath)
        // Resolve once the server reports status as 'LISTENING'
        return onReady()
      })

      serverStartPromise.then(() =>
        console.log('Backend ready!')
      )

      const serverStartTimeoutPromise = promiseTimeout(
        serverStartPromise,
        SERVER_START_TIMEOUT,
        'Server start timeout'
      )

      serverStartTimeoutPromise.catch(e => {
        // We could get here when the timeout timer has not yet started and the
        // server status is still 'STARTING', so we update the status to an
        // error
        onStatusChange(STATUS.ERROR)
      })

      return serverStartTimeoutPromise
    },

    addServerStateListener: function addServerStateListener(
      handler: (status: ServerStatus) => any
    ): Subscription {
      log('listener', handler)
      listeners.push(handler)
      return {
        remove: () => (listeners = listeners.filter(h => h !== handler))
      }
    },

  }

  return api
}

export default Api({ baseUrl: BASE_URL })
