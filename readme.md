# Cabal Mobile

Chat with the p2p swarm on your mobile device (Android & maybe iOS).

<img src="./screenshot.jpg" width="240">

## Install

Not yet on the Play Store, so fetch the APK from the Releases page here in GitHub and then install locally on your device (put it in developer mode first).

## Development

Credits go to the contributors of cabal-node, react-native, react-navigation, react-native-gifted-chat, and nodejs-mobile.

First make sure you follow the official React Native docs to setup your local environment with the necessary compilers for Android and/or iOS. Then, git clone this project, and install dependencies:

```bash
npm install
```

Also install dependencies in the backend project:

```bash
cd nodejs-assets/nodejs-project
npm install
```

Then run

```bash
react-native run-android
```

If things go wrong, try rebuilding the backend:

```bash
cd android
./gradlew clean
cd ..
react-native run-android
```

## License

GPL 🤘
