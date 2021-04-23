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

# Media Services
AMS_CONNECTION=""
AAD_SERVICE_PRINCIPAL_SECRET=""
if [ -z "$(az ams account list --query "[?name=='${AMS_ACCOUNT}']" -o tsv)" ]; then
    AAD_SERVICE_PRINCIPAL_SECRET=""
    SPN=""
else
    SPN="$AMS_ACCOUNT-access-sp"
    if [ -z "$(az ad sp list --display-name $SPN --query="[].displayName" -o tsv)" ]; then
        AMS_CONNECTION=$(az ams account sp create -o yaml --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT)
    else
        AMS_CONNECTION=$(az ams account sp reset-credentials -o yaml --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT)
    fi

    re="AadSecret:[[:space:]]([0-9a-z\-]*)"
    AAD_SERVICE_PRINCIPAL_SECRET=$([[ "$AMS_CONNECTION" =~ $re ]] && echo ${BASH_REMATCH[1]})
fi

output="{
    \"deviceinfo\":{\"deviceConnectString\":\"$DEVICE_CONNECTION_STRING\"},
    \"amsinfo\":{
        \"servicesPrincipalName\":\"$SPN\",
        \"servicesPrincipalSecret\":\"$AAD_SERVICE_PRINCIPAL_SECRET\"
    }
}"
    
echo "$output" > $AZ_SCRIPTS_OUTPUT_PATH
