#!/usr/bin/env bash
set -e

if [ -z "$BUGSNAG_API_KEY" ]; then
  echo "Missing env BUGSNAG_API_KEY"
  exit 1
fi

CURRENT_VERSION="$(npx -c 'echo "$npm_package_version"')"

# Generate source maps using react-native bundler
react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android-release.bundle \
  --sourcemap-output android-release.bundle.map

# Upload source maps to Bugsnag, making sure to specify the correct app-version.
curl https://upload.bugsnag.com/react-native-source-map \
  -F apiKey="$BUGSNAG_API_KEY" \
  -F appVersion="$CURRENT_VERSION" \
  -F dev=false \
  -F platform=android \
  -F sourceMap=@android-release.bundle.map \
  -F bundle=@android-release.bundle \
  -F projectRoot=$(pwd)
