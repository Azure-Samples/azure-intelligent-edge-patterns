#!/bin/bash

read -p "Enter desired name for new namespace: " FHIR_NAMESPACE
echo "Creating namespace: $FHIR_NAMESPACE"
kubectl create namespace $FHIR_NAMESPACE

echo "Writing .env to fhir-env secret"
kubectl --namespace $FHIR_NAMESPACE create secret generic fhir-env  --from-env-file ./.env

read -p "Path to certificate file:" CERT_FILE
echo "Writing certificate to fhir-server-certificate"
kubectl --namespace $FHIR_NAMESPACE create secret generic fhir-server-certificate --from-file=certificate=$CERT_FILE

read -p "Desired Helm deployment name: " DEPLOYMENT_NAME
helm install $DEPLOYMENT_NAME ./helm/fhirk8s --namespace $FHIR_NAMESPACE