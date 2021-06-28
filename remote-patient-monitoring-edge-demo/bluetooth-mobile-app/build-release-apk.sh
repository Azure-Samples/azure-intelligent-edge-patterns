#!/usr/bin/env bash 

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

display_usage() { 
	echo "Arguments required for this script: <patientUuid> <iotHubResourceName> <policyKey> <deviceId>"
	echo -e "Ex: ./build-release-apk.sh 43804f65-92ca-40e9-be03-3c938749215d my-iot-hub-resource my-policy-key my-new-device" 
}

if [ $# -le 3 ] 
	then 
		display_usage
		exit 1
fi 

if [[ ( $# == "--help") ||  $# == "-h" ]] 
	then 
		display_usage
		exit 0
fi

echo "Injecting environment variables..."

set -ex

PID="${1}"
IOT_HUB_NAME="${2}"
POLICY_KEY="${3}"
DEVICE_ID="${4}"
# Create .env file if it does not exist
touch .env
echo PATIENT_ID=$PID > .env
echo IOT_HUB_NAME=$IOT_HUB_NAME >> .env
echo POLICY_KEY=$POLICY_KEY >> .env
echo DEVICE_ID=$DEVICE_ID >> .env

npm install
cd android
./gradlew assembleRelease