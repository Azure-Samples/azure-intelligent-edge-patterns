#!/usr/bin/env bash
set -euo pipefail
 
install() {
  echo Installing MLflow
  kubectl create namespace mlflow
  kubectl apply -f ./tracking_server.yaml --namespace mlflow
}
 
upgrade() {
  echo World 2.0
}
 
uninstall() {
  echo Uninstalling MLflow server
  kubectl delete namespace mlflow
}
 
# Call the requested function and pass the arguments as-is
"$@"
