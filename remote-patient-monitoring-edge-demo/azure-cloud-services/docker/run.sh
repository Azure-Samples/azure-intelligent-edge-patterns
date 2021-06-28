#!/usr/bin/env bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# USAGE: run.sh deploy

# git-bash fix. prevent path mangling.
export MSYS_NO_PATHCONV=1

docker run \
    -v $HOME/.azure/:/root/.azure/  \
    -v $(pwd):/work \
    --workdir=/work \
    mcr.microsoft.com/azure-cli \
    ./docker/$1.sh