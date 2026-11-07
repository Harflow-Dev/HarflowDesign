#!/bin/sh
# Validates the design catalog and stages the public site in dist/.
set -eu

cd "$(dirname "$0")/.."

for file in archive/v1/scripts/*.js archive/v1/features/*.js v2/scripts/*.js; do
  node --check "$file"
done

# Two tests read the sibling HarflowMac checkout, which CI does not have:
# native source provenance at the pinned commit, and the bundled branding bytes.
# Both run locally when ../HarflowMac exists or HARFLOW_MAC_ROOT is set.
node --test \
  --test-skip-pattern='^registry source links resolve in the pinned HarflowMac tree$' \
  --test-skip-pattern='^bundled branding matches the native resources byte for byte$' \
  tests/*.mjs

rm -rf dist
mkdir -p dist
cp index.html _redirects dist/
cp -R archive docs v2 dist/
