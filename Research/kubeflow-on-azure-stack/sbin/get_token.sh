#!/bin/sh
#
# This script helps retrieving the token, needed to login to kubernetes dashboard
#

echo "kubectl -n kube-system describe \$(kubectl -n kube-system get secret -n kube-system -o name | grep namespace) | grep token\n"
kubectl -n kube-system describe $(kubectl -n kube-system get secret -n kube-system -o name | grep namespace) | grep token

