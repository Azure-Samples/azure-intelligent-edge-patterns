#!/usr/bin/env sh

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

NAME=${1:-'data-analysis'}

# If the second param is not provided, the git command will run to create default value
TAG=${2:-$(git rev-parse --short HEAD || echo "HASH-NOT-FOUND")}

TAG="wwtmsft.azurecr.io/${NAME}:${TAG}"

docker build -t ${TAG} .
docker push ${TAG}
