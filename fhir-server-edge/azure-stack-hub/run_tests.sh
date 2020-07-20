#!/bin/bash
set -e

az aks get-credentials --name aks-fhir-server-cicd --resource-group rg-fhir-cicd

echo "Retrieving FHIR service IP"
FHIR_IP=$(kubectl get service fhir-service --namespace fhir-cicd --output jsonpath={.status.loadBalancer.ingress[0].ip})
echo $FHIR_IP

echo "Testing server connectivity"
FHIR_RESPONSE=$(curl -I http://$FHIR_IP:8080/health/check 2>/dev/null | head -n 1 | cut -d$' ' -f2)
echo "Response code from server: $FHIR_RESPONSE"

if [ "${FHIR_RESPONSE}" != "200" ]; then
    echo "Error: Bad response code from FHIR server" 1>&2
    exit 1
fi

echo "Testing server health"
FHIR_STATUS=$(curl http://$FHIR_IP:8080/health/check | jq -r '.overallStatus')
echo "FHIR service is: $FHIR_STATUS"

if [ "$FHIR_STATUS" != "Healthy" ]; then
    echo "Error: FHIR service is not healthy" 1>&2
    exit 1
fi