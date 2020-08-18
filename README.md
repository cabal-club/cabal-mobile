# hypercore-react-native

[![Build Status](https://app.bitrise.io/app/288e6b3c3069b8e6/status.svg?token=WQq3QO2MrSbNUnr4mfO8gQ&branch=master)](https://app.bitrise.io/app/288e6b3c3069b8e6)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> React native example for building applications using hypercore

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Usage

1. Fork this repository, or `git clone` and push to your own new repository.
2. Edit `src/backend/server.js` and create your backend server that can
   communicate and serve assets to the frontend. This is similar
   to Electron! The only difference here is that with nodejs-mobile, the
   frontend controls the lifecycle of the backend, rather than the other way around.
3. Communicate between the backend and frontend in `src/frontend/api.js` and
   `src/backend/server.js` using `rn-bridge`, localhost http requests, or
    websockets depending on what you need (e.g., static assets should go over http
    requests, while commands to hypercore could be done using the `rn-bridge`
    package).
4. Create your front-end at `src/frontend/AppContainer.js`! 
5. Add your logo and splash screen in the following repositories:
  * `android/app/src/main/res/*/*.png`
  * `android/app/src/qa/res/*/*.png`

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
