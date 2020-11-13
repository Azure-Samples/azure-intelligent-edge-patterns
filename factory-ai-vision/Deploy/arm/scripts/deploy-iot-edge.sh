#!/bin/bash

# This script generates a deployment manifest template and deploys it to an existing IoT Edge device

# =========================================================
# Variables
# =========================================================
IOTEDGE_DEV_VERSION="2.1.4"

# =========================================================
# Define helper function for logging
# =========================================================
info() {
    echo "$(date +"%Y-%m-%d %T") [INFO]"
}

# Define helper function for logging. This will change the Error text color to red
error() {
    echo "$(tput setaf 1)$(date +"%Y-%m-%d %T") [ERROR]"
}

exitWithError() {
    # Reset console color
    tput sgr0
    exit 1
}


# =========================================================
# Install packages
# =========================================================
apt-get update && apt-get install -y git jq coreutils


echo "$(info) Installing packages"
echo "$(info) Installing iotedgedev"
pip install --upgrade iotedgedev==${IOTEDGE_DEV_VERSION}

echo "$(info) Updating az-cli"
pip install --upgrade azure-cli
pip install --upgrade azure-cli-telemetry

# =========================================================
# Login Azure
# =========================================================
# Pass since ARM already logged-in with identity.

# =========================================================
# Install Azure CLI extension
# =========================================================
echo "$(info) Installing azure iot extension"
az extension add --name azure-iot

pip3 install --upgrade jsonschema
echo "$(info) Installation complete"

# =========================================================
# IoT Hub Create IoTHub/Edge device if not exists
# =========================================================
set -e

if [ -z "$(az iot hub list --query "[?name=='$IOTHUB_NAME'].name" --resource-group "$RESOURCE_GROUP" -o tsv)" ]; then
    echo "$(error) IoT Hub \"$IOTHUB_NAME\" does not exist."
    exit 1
else
    echo "$(info) Using existing IoT Hub \"$IOTHUB_NAME\""
fi

if [ -z "$(az iot hub device-identity list --hub-name "$IOTHUB_NAME" --resource-group "$RESOURCE_GROUP" --query "[?deviceId=='$DEVICE_NAME'].deviceId" -o tsv)" ]; then
    echo "$(error) Device \"$DEVICE_NAME\" does not exist in IoT Hub \"$IOTHUB_NAME\""
    exit 1
else
    echo "$(info) Using existing Edge Device \"$IOTHUB_NAME\""
fi

# =========================================================
# ENV template replacement
# =========================================================
REPO_OUTPUT_DIR="manifest-iot-hub"
MANIFEST_PATH="${REPO_OUTPUT_DIR}"
ENV_TEMPLATE_PATH="${MANIFEST_PATH}/env-template"
ENV_PATH="${MANIFEST_PATH}/.env"

rm -rf ${REPO_OUTPUT_DIR}
rm -f archive.zip

wget "https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/EdgeSolution/archive.zip"
unzip archive.zip -d ${REPO_OUTPUT_DIR}
rm -f archive.zip
cp ${ENV_TEMPLATE_PATH} ${ENV_PATH}

# =========================================================
# Azure CLI
# =========================================================
IOTHUB_CONNECTION_STRING=$(az iot hub show-connection-string --name ${IOTHUB_NAME} | jq ".connectionString")
CUSTOM_VISION_TRAINING_KEY=$(az cognitiveservices account keys list --name ${CUSTOMVISION_NAME} -g ${RESOURCE_GROUP} | jq ".key1")
CUSTOM_VISION_ENDPOINT=$(az cognitiveservices account show --name ${CUSTOMVISION_NAME} -g ${RESOURCE_GROUP} | jq ".properties.endpoint")
SUBSCRIPTION_ID=$(az account show | jq ".id")
TENANT_ID=$(az account show | jq ".managedByTenants[0].tenantId")


AMS_SP_SECRET=$(echo ${AMS_SP_JSON} | jq ".AadSecret")
AMS_SP_ID=$(echo ${AMS_SP_JSON} | jq ".AadClientId")
AMS_NAME="\"${AMS_NAME}\""

echo "$(info) Gening .env ${ENV_PATH}"


sed -i -e "s|^CONTAINER_REGISTRY_NAME=.*$|CONTAINER_REGISTRY_NAME=${CONTAINER_REGISTRY_NAME}|g" ${ENV_PATH}
sed -i -e "s|^CONTAINER_REGISTRY_USERNAME=.*$|CONTAINER_REGISTRY_USERNAME=${CONTAINER_REGISTRY_USERNAME}|g" ${ENV_PATH}
sed -i -e "s|^CONTAINER_REGISTRY_PASSWORD=.*$|CONTAINER_REGISTRY_PASSWORD=${CONTAINER_REGISTRY_PASSWORD}|g" ${ENV_PATH}
sed -i -e "s|^IOTHUB_CONNECTION_STRING=.*$|IOTHUB_CONNECTION_STRING=$IOTHUB_CONNECTION_STRING|g" ${ENV_PATH}
sed -i -e "s/^SUBSCRIPTION_ID=.*$/SUBSCRIPTION_ID=${SUBSCRIPTION_ID}/g" ${ENV_PATH}
sed -i -e "s/^RESOURCE_GROUP=.*$/RESOURCE_GROUP=\"${RESOURCE_GROUP}\"/g" ${ENV_PATH}
sed -i -e "s/^TENANT_ID=.*$/TENANT_ID=${TENANT_ID}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_NAME=.*$/SERVICE_NAME=${AMS_NAME}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_PRINCIPAL_APP_ID=.*$/SERVICE_PRINCIPAL_APP_ID=${AMS_SP_ID}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_PRINCIPAL_SECRET=.*$/SERVICE_PRINCIPAL_SECRET=${AMS_SP_SECRET}/g" ${ENV_PATH}
sed -i -e "s|^CUSTOM_VISION_ENDPOINT=.*$|CUSTOM_VISION_ENDPOINT=${CUSTOM_VISION_ENDPOINT}|g" ${ENV_PATH}
sed -i -e "s/^CUSTOM_VISION_TRAINING_KEY.*$/CUSTOM_VISION_TRAINING_KEY=${CUSTOM_VISION_TRAINING_KEY}/g" ${ENV_PATH}

# =========================================================
# Choosing IoTHub Deployment template
# =========================================================
printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Configuring IoT Hub"
printf "%60s\n" " " | tr ' ' '-'

echo "$(info) INFERENCE_MODULE_RUNTIME: ${INFERENCE_MODULE_RUNTIME}"
echo "$(info) EDGE_DEVICE_ARCHITECTURE: ${EDGE_DEVICE_ARCHITECTURE}"
echo "$(info) VIDEO_CAPTURE_MODULE: ${VIDEO_CAPTURE_MODULE}"

MANIFEST_TEMPLATE_BASE_NAME="deployment"
MANIFEST_ENVIRONMENT_VARIABLES_FILENAME=".env"


if [ "$INFERENCE_MODULE_RUNTIME" == "NVIDIA" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.gpu"
elif [ "$INFERENCE_MODULE_RUNTIME" == "MOVIDIUS" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.vpu"
else
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.cpu"
fi

if [ "$EDGE_DEVICE_ARCHITECTURE" == "ARM64" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.arm64v8"
fi

if [ "$VIDEO_CAPTURE_MODULE" == "opencv" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.opencv"
fi

MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.template.json"

echo "$(info) Deployment template choosen: ${MANIFEST_TEMPLATE_NAME}"

# =========================================================
# Generate Deployment Manifast
# =========================================================
echo "$(info) Generating manifest file from template file"
cd ${MANIFEST_PATH}
rm -rf config
iotedgedev genconfig --file "${MANIFEST_TEMPLATE_NAME}"

echo "$(info) Generated manifest file"

# =========================================================
# Get Deployment Manifest
# =========================================================
PRE_GENERATED_MANIFEST_FILENAME="./config/deployment.json"
find ./config -name "*.json" | xargs -I{} mv {} "${PRE_GENERATED_MANIFEST_FILENAME}"

if [ ! -f "${PRE_GENERATED_MANIFEST_FILENAME}" ]; then
    echo "$(error) Manifest file \"${PRE_GENERATED_MANIFEST_FILENAME}\" does not exist. Please check config folder under current directory: \"$PWD\" to see if manifest file is generated or not"
fi

# =========================================================
# IoT Hub Deploy
# =========================================================
az iot edge deployment create --deployment-id "${DEPLOYMENT_NAME}" --hub-name "${IOTHUB_NAME}" --content "${PRE_GENERATED_MANIFEST_FILENAME}" --target-condition "deviceId='${DEVICE_NAME}'" --output "none"

echo "$(info) Deployed manifest file to IoT Hub. Your modules are being deployed to your device now. This may take some time."
