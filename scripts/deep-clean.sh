#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

# This does a deep-clean of cache files in react-native and gradle / Android
# Use this if you are having issues with builds not working
echo -en "Cleaning metro bundler cache\n"
watchman watch-del-all
rm -rf "$TMPDIR/react-native-packager-cache-*"
rm -rf "$TMPDIR/metro-bundler-cache-*"
echo -en "Remove node_modules\n"
rm -rf node_modules/
rm -rf src/backend/node_modules
echo -en "Re-install node_modules\n"
npm install
echo -en "Cleaning gradle cache and stopping daemon"
(
  cd android
  ./gradlew clean
  ./gradlew cleanBuildCache
  ./gradlew --stop
)
echo -en "Remove gradle temp folders\n"
rm -rf android/.gradle
rm -rf android/build

echo -en "Restart metrobundler with clean cach\n"
npm start -- --reset-cache
