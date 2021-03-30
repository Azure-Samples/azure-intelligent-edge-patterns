#!/usr/bin/env bash 

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

display_usage() { 
	echo "Arguments required for this script: <iotHubResourceName> <deviceId>"
	echo -e "Ex: ./setup-environment.sh my-iot-hub-resource my-device-id"
} 
  
# if less than two arguments supplied, display usage message
if [ $# -le 1 ] 
	then 
		display_usage
		exit 1
fi 
 
# check whether user had supplied -h or --help . If yes display usage 
if [[ ( $# == "--help") ||  $# == "-h" ]] 
	then 
		display_usage
		exit 0
fi 

set -ex

iotHubName=$1
deviceId=$2
iotHubConnectionString=$(az iot hub device-identity connection-string show -n $iotHubName -d $deviceId --query connectionString)
fhirIp=$(kubectl get services fhir-server-svc --output jsonpath='{.status.loadBalancer.ingress[0].ip}{"\n"}')

if [ -z iotHubConnectionString ]
then
  echo "IoT Hub Connection String is invalid. Please check your IoT Hub resource name and device id."
  exit 1
fi

if [ -z fhirIp ]
then
  echo "Fhir API URL is malformed. Make sure your kubectl is correctly configured and fhir-server-svc is deployed."
  exit 1
fi

fhirApiUrl=http://$fhirIp:8080

echo FHIR_API_URL=$fhirApiUrl > .env.production
echo IOT_HUB_CONNECTION_STRING=$iotHubConnectionString >> .env.production
