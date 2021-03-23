#!/usr/bin/env bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

set -e

PROJECT="wwt/MSFT-Intel/$1"
VERSION=$2
API_KEY=$3

bash <(curl -s -L https://detect.synopsys.com/detect.sh) \
--blackduck.url='https://worldwidetechnology.app.blackduck.com' \
--blackduck.api.token="${API_KEY}" \
--detect.project.name="${PROJECT}" \
--detect.project.version.name="${VERSION}" \
--detect.code.location.name="${PROJECT}-${VERSION}" \
--detect.detector.search.continue=true \
--detect.detector.search.depth=0

