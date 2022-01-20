#!/bin/sh
#
# extracting TensorBoard's pod name and forwarding 6006 to the outside
#
export PODNAME=$(kubectl get pod -l app=tensorboard -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward ${PODNAME} 6006:6006
