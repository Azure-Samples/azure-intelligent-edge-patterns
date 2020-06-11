#!/bin/bash
#
# This script helps to obtain the external ip of the Kubeflow dashboard.
#
# NOTE: you will need to edit the ingress behaviour manually using: 
# $ kubectl edit -n istio-system svc/istio-ingressgateway
# 

echo "kubectl get -w -n istio-system svc/istio-ingressgateway"
kubectl get -w -n istio-system svc/istio-ingressgateway

