#!/bin/sh

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

kubectl apply -f ./kubernetes/deployment.yaml

kubectl rollout restart deployment analysis-deployment

# ^^ TODO: hard coded strings could be handled with helm
# See: https://msft-intel.atlassian.net/secure/RapidBoard.jspa?rapidView=1&projectKey=MI&modal=detail&selectedIssue=MI-91
