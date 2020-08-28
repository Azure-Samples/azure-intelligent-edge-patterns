#!/usr/bin/env bash
set -euo pipefail

install() {
  echo Installing MLflow

  echo "[INFO] Checking if MLflow deployment already exists on cluster ..."
  echo "[INFO] Listing Namespaces"
  kubectl get namespaces

  if ( (kubectl get namespace mlflow) )
  then
    echo "[ERROR] MLflow has already been installed on this cluster. Please uninstall before reinstalling."
    exit 1
  else
    echo "[INFO] Installing MLflow into mlflow namespace..."
    kubectl create namespace mlflow || exit 1
    kubectl apply -f ./tracking_server.yaml --namespace mlflow || exit 1
    kubectl get service mlflow-service --namespace mlflow --output jsonpath={.status.loadBalancer.ingress[0].ip} || exit 1
  fi
  
}

upgrade() {
  echo "[INFO] Upgrade functionality has not been implemented"
}

uninstall() {

  echo "[INFO] Checking if MLflow deployment already exists on cluster ..."
  echo "[INFO] Listing Namespaces"
  kubectl get namespaces

  if ( (kubectl get namespace mlflow) )
  then
    echo "[INFO] Uninstalling MLflow from cluster..."
    kubectl delete namespace mlflow --now=true --wait=true || exit 1
  else
    echo "[ERROR] MLflow has not been installed on this cluster. Please install before attempting to uninstall."
    exit 1        
  fi
  
}

# Call the requested function and pass the arguments as-is
"$@"