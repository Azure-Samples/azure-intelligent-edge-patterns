#!/usr/bin/env bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

set -ex

ACR=${1:?'You must provide the URL of your ACR'}
SECRET=${2:-'acr-secret'}

# Enable Admin user in ACR
az acr update -n ${ACR} --admin-enabled true

# Get admin password for ACR
PASSWORD="$(az acr credential show -n ${ACR} -o tsv --query 'passwords[0].value')" 

# Authenticate local docker to ACR
docker login ${ACR} --username ${ACR%.*.*} --password ${PASSWORD} 

# Authenticate k8s to ACR
kubectl create secret docker-registry ${SECRET} --docker-server=${ACR} --docker-username=${ACR%.*.*} --docker-password=${PASSWORD}

echo "Success! You can now docker push to ACR. k8s on the ASE can also docker pull from there when you deploy."