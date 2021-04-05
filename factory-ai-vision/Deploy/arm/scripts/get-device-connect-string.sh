#!/bin/bash

echo "installing azure iot extension"
az extension add --name azure-iot

# Register an IoT Edge device
DEVICE_NAME_GOT="$(az iot hub device-identity list --hub-name "${IOTHUB_NAME}" --resource-group "${RESOURCE_GROUP}" --query "[?deviceId=='${DEVICE_NAME}'].deviceId" -o tsv)"
if [ -z ${DEVICE_NAME_GOT} ]; then
    az iot hub device-identity create --device-id ${DEVICE_NAME} --edge-enabled --hub-name ${IOTHUB_NAME}
else
    echo "Using existing Edge Device ${DEVICE_NAME}"
fi

DEVICE_CONNECTION_STRING="$(az iot hub device-identity connection-string show --device-id ${DEVICE_NAME} --hub-name ${IOTHUB_NAME} -o tsv)"

output="{\"deviceinfo\":{\"deviceConnectString\":\"$DEVICE_CONNECTION_STRING\"}}"
echo "$output" > $AZ_SCRIPTS_OUTPUT_PATH