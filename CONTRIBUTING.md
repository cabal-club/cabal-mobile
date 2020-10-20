# Contributing

This is a mobile app written in react-native that currently runs on
Android. For most development you will need the Android SDK installed on your
computer, but it is possible to contribute to UI Component development using the
storybook server.

## Initial Install

In order to start developing you will need git and node >=12 installed on your
computer. For many development tasks you will also need the Android SDK installed.

```sh
npm install
```

Install backend dependencies

```
cd src/backend
npm install
```

## Storybook

[Storybook](https://storybook.js.org) is a tool for developing React UI
components in isolation. You can see how a component renders with different
props as inputs, and changes you make to the code will update in realtime
through the storybook UI. What you see in the Storybook UI is defined by
"stories" which are in the [`src/stories`](src/stories) folder.

### Storybook Native

For a development environment that is close to the actual app end-users will
see you can run storybook on a device or in the Android emulator. To install and
run the app in storybook mode on a device:

```sh
npm run android-storybook
```

You can edit components and write new stories and see how components on-screen
render in isolation.

Optionally you can also start a server that will give you a web interface to
control what you see on the mobile device:

```sh
adb reverse tcp:7007 tcp:7007
npm run storybook-native
```

You will probably need to reload the storybook mobile app for the web app to be
able to control the mobile app.

## Full App Development

### Pre-requisites

In order to develop the full app you will need the Android SDK installed and
[r19c of NDK](https://developer.android.com/ndk/guides/) in order to build
nodejs-mobile for Android.

You may need to open your app's `/android` folder in Android Studio, so that it detects, downloads and cofigures requirements that might be missing, like the NDK and CMake to build the native code part of the project.

You can also set the environment variable `ANDROID_NDK_HOME`, as in this example:

```sh
export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle
```

### Testing Device

To use a real device, you will need to [enable USB
debugging](https://developer.android.com/studio/debug/dev-options) and connect
the phone to your computer with a USB cable.

Enter `adb devices` in the terminal to check that you can see the phone. You
may need to unlock the phone screen and say that you trust your computer in
order for adb to connect.

You can also test the Mobile app in an emulator. [Set up a virtual device in
Android Studio](https://developer.android.com/studio/run/managing-avds). Choose
`x86` as the `ABI`, since this will be much faster.

### Starting the dev version

Connect your phone with USB, or start up the emulator, then build and run the
dev version of the app on your device:

```sh
npm run android
```

You can configure the app to reload whenever you make a change: shake the device
to bring up the developer menu, and select "Enable Live Reload". Whenever you
change the code the app should reload. Changes to any code in the `src/frontend`
folder will appear immediately after a reload. If you change anything in
`src/backend` you will need to re-run `npm run android` in order to see changes.
If you are tired of shaking the phone you can enter `npm run dev-menu` from your
computer.

`npm run android` does two things: starts "Metro bundler" in one window, and
then builds and installs the dev version on the connected device. To
start Metro bundler on its own (e.g. if you already have the app installed), use
`npm start`.

## Troubleshooting

### `error: bundling failed: ReferenceError: Module not registered in graph`

If you see this error from the Metro Bundler it is most likely that you ran `npm install` and added modules when the Metro Bundler was already running (`npm start`). Try quitting with bundler with `Ctrl-C` and then re-starting it with
`npm start`. If that doesn't work also try restarting with a new cache with `npm start --reset-cache`.

### `ENOSPC` Error in gradle build

If you see Android builds failing with an error like this:

```
Error: watch /bitrise/src/node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/picker/events ENOSPC
    at FSWatcher.start (fs.js:1382:19)
    at Object.fs.watch (fs.js:1408:11)
    at NodeWatcher.watchdir (/bitrise/src/node_modules/sane/src/node_watcher.js:159:22)
    at Walker.<anonymous> (/bitrise/src/node_modules/sane/src/common.js:109:31)
    at emitTwo (events.js:126:13)
    at Walker.emit (events.js:214:7)
    at /bitrise/src/node_modules/walker/lib/walker.js:69:16
    at go$readdir$cb (/bitrise/src/node_modules/graceful-fs/graceful-fs.js:162:14)
    at FSReqWrap.oncomplete (fs.js:135:15)
```

Then try [increasing the number of inotify
watchers](https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers#the-technical-details)

```sh
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

### App does not reload or install

Sometimes the connection through adb to the phone gets "stuck". Kill the adb
server, restart it, and connect the metro bundler with these steps:

```sh
adb kill-server
adb devices
adb reverse tcp:8081 tcp:8081
```
