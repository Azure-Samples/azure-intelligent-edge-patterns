#!/bin/bash

kubectl create -f tensorflow_flowers.yaml -n kfserving-test

echo give the inferenceservice time to create the pods...
sleep 5

export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

export MODEL_NAME=flowers-sample
export INPUT_PATH=@./tensorflow_input.json
export SERVICE_HOSTNAME=$(kubectl get inferenceservice ${MODEL_NAME} -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

echo curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict -d $INPUT_PATH
curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict -d $INPUT_PATH
