# cabal-mobile

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Mobile application for Cabal

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Usage

See [CONTRIBUTING](CONTRIBUTING.md]) for more detailed information on how to
get set up.

Short version below...

0. Install React Native toolchain.

1. Install dependencies

```
npm install
cd src/backend && npm install && cd ..
```

2. Plug in your phone

3) Build and install

This will build the backend and front end and also install the application on
your phone (or virtual device). If you change the backend code, you need to run
this command to rebuild and reinstall the app.

```
npm run android
```

4. Dynamic refresh

In another terminal, you can run this command and the application will refresh
every time you change the frontend.

```
npm start
```

## Community

Connect with the Cabal community for support and to contribute! PRs accepted!

- [**CABAL**](https://cabal.chat) (https://cabal.chat)
- [**IRC**](https://kiwiirc.com/nextclient/irc.freenode.net/) (channel #cabal.club)

## Contributing

See [the contributing file](CONTRIBUTING.md)!

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT
