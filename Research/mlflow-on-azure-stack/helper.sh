#!/usr/bin/env bash
set -euo pipefail

install() {
  echo Installing MLflow
  kubectl create namespace mlflow
  kubectl apply -f ./tracking_server.yaml --namespace mlflow
  kubectl get service mlflow-service --namespace mlflow --output jsonpath={.status.loadBalancer.ingress[0].ip}
}

upgrade() {
  echo Upgrade functionality has not been implemented
}

uninstall() {
  echo Uninstalling MLflow server
  kubectl delete namespace mlflow --now=true --wait=true
}

# Call the requested function and pass the arguments as-is
"$@"