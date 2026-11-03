#!/bin/sh
# Validates the design catalog and stages the public site in dist/.
set -eu

cd "$(dirname "$0")/.."

for file in scripts/*.js features/*.js v2/scripts/*.js; do
  node --check "$file"
done

# Native source provenance is checked locally with the sibling HarflowMac checkout.
node --test --test-skip-pattern='^registry source links resolve in the pinned HarflowMac tree$' tests/catalog.test.mjs tests/v2.test.mjs

rm -rf dist
mkdir -p dist
cp index.html dist/
cp -R scripts styles assets docs features v2 dist/
