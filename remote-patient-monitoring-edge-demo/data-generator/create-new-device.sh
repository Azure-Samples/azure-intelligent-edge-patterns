#!/usr/bin/env bash 

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

display_usage() { 
	echo "Arguments required for this script: <iotHubResourceName> <deviceName>"
	echo -e "Ex: ./create-new-device.sh my-iot-hub-resource my-new-device"
} 
  
# if less than three arguments supplied, display usage message
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

iothubname=$1
devicename=$2

az extension add --name azure-iot

az iot hub device-identity create --hub-name $iothubname --device-id $devicename

az iot hub device-identity connection-string show --hub-name $iothubname --device-id $devicename --output table

az iot hub show --query properties.eventHubEndpoints.events.endpoint --name $iothubname

az iot hub show --query properties.eventHubEndpoints.events.path --name $iothubname

az iot hub policy show --name service --query primaryKey --hub-name $iothubname