#!/bin/bash

# Default to 'latest' if VERSION is not set
VERSION=${VERSION:-'latest'}

# Update the contract using aztec CLI
aztec update --contract . --aztec-version "$VERSION"

# Extract tag from Nargo.toml in token directory
TAG=$(grep -oP 'tag\s*=\s*"\K[^"]+' "packages/contracts/token_contract/Nargo.toml" | head -1)

# Run the update contract script with extracted tag
./.github/scripts/update_contract.sh "packages/contracts/token_contract" "$TAG"

yarn workspace scripts update

# Update dependencies with yarn
yarn
