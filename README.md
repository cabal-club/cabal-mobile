# nodejs-mobile-native-template

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> React native example for building applications using Node.js native modules

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Usage

First time setup? See [CONTRIBUTING](CONTRIBUTING.md])

## Creating my first app

Assuming you're able to run the app, you should see a blank screen that says
'Home Screen'.
  
1. Edit `src/backend/server.js` and create your backend server that can
   communicate and serve assets to the frontend. This is similar
   to Electron! The only difference here is that with nodejs-mobile, the
   frontend controls the lifecycle of the backend, rather than the other way around.
1. Communicate between the backend and frontend in `src/frontend/api.js` and
   `src/backend/server.js` using `rn-bridge`, localhost http requests, or
    websockets depending on what you need (e.g., static assets should go over http
    requests, while commands to Node.js can be done using the `rn-bridge`
    package).
1. Create your front-end at `src/frontend/AppContainer.js`! 
1. Add your logo and splash screen to `android/app/src/main/res/*/*.png` and `android/app/src/qa/res/*/*.png`

## Maintainers

- [@okdistribute](https://github.com/okdistribute)
- You?

PRs accepted!

## Community

Connect with the Dat community for support and to contribute!

- [**IRC**](https://kiwiirc.com/nextclient/irc.freenode.net/) (channel #dat)

## Contributing

See [the contributing file](CONTRIBUTING.md)!


Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT
