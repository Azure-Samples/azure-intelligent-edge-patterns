#!/usr/bin/env bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# run.sh deploy

docker run \
    -v ~/.azure/:/root/.azure/  \
    -v $(pwd):/work \
    --workdir="/work" \
    mcr.microsoft.com/azure-cli \
    ./docker/$1.sh