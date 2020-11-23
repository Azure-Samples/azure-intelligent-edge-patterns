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


printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Installing apt-packages "
apt-get update && apt-get install -y jq coreutils
echo "$(info) Apt-packages installed"

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Installing pip packages."
python -m pip -q install --upgrade pip
echo "$(info) Installing iotedgedev."
pip -q install --upgrade iotedgedev==${IOTEDGE_DEV_VERSION}

echo "$(info) Updating Azure CLI."
pip -q install --upgrade azure-cli
pip -q install --upgrade azure-cli-telemetry

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Installing Azure IoT extension."
az extension add --name azure-iot
pip -q install --upgrade jsonschema

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Checking IoT Hub and IoT Edge Device."

IOTHUB_NAME_GOT=$(az iot hub list --query "[?name=='${IOTHUB_NAME}'].name" --resource-group "${RESOURCE_GROUP}" -o tsv)
if [ -z ${IOTHUB_NAME_GOT} ]; then
    echo "$(error) IoT Hub \"${IOTHUB_NAME}\" does not exist."
    exit 1
else
    echo "$(info) Using existing IoT Hub \"${IOTHUB_NAME}\""
    IOTHUB_NAME=${IOTHUB_NAME_GOT}
fi

if [ -z "$(az iot hub device-identity list --hub-name "${IOTHUB_NAME}" --resource-group "${RESOURCE_GROUP}" --query "[?deviceId=='${DEVICE_NAME}'].deviceId" -o tsv)" ]; then
    echo "$(error) Device \"${DEVICE_NAME}\" does not exist in IoT Hub \"${IOTHUB_NAME}\""
    exit 1
else
    echo "$(info) Using existing Edge Device \"${IOTHUB_NAME}\""
fi

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Getting IoTHub deploy Manifest."

REPO_OUTPUT_DIR="manifest-iot-hub"
MANIFEST_PATH="${REPO_OUTPUT_DIR}"
ENV_TEMPLATE_PATH="${MANIFEST_PATH}/env-template"
ENV_PATH="${MANIFEST_PATH}/.env"

rm -rf ${REPO_OUTPUT_DIR}
rm -f archive.zip

wget --quiet "https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/EdgeSolution/archive.zip"
unzip -q archive.zip -d ${REPO_OUTPUT_DIR}
rm -f archive.zip
cp ${ENV_TEMPLATE_PATH} ${ENV_PATH}


printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Retrieve data from Azure."

IOTHUB_CONNECTION_STRING=$(az iot hub show-connection-string --name ${IOTHUB_NAME} | jq ".connectionString")
CUSTOM_VISION_TRAINING_KEY=$(az cognitiveservices account keys list --name ${CUSTOMVISION_NAME} -g ${RESOURCE_GROUP} | jq ".key1")
CUSTOM_VISION_ENDPOINT=$(az cognitiveservices account show --name ${CUSTOMVISION_NAME} -g ${RESOURCE_GROUP} | jq ".properties.endpoint")
SUBSCRIPTION_ID=$(az account show | jq ".id")
TENANT_ID=$(az account show | jq ".managedByTenants[0].tenantId")
AMS_SP_SECRET=$(echo ${AMS_SP_JSON} | jq ".AadSecret")
AMS_SP_ID=$(echo ${AMS_SP_JSON} | jq ".AadClientId")
AMS_NAME="\"${AMS_NAME}\""

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Generating .env ${ENV_PATH}"

sed -i -e "s|^CONTAINER_REGISTRY_NAME=.*$|CONTAINER_REGISTRY_NAME=\"${CONTAINER_REGISTRY_NAME}\"|g" ${ENV_PATH}
sed -i -e "s|^CONTAINER_REGISTRY_USERNAME=.*$|CONTAINER_REGISTRY_USERNAME=\"${CONTAINER_REGISTRY_USERNAME}\"|g" ${ENV_PATH}
sed -i -e "s|^CONTAINER_REGISTRY_PASSWORD=.*$|CONTAINER_REGISTRY_PASSWORD=\"${CONTAINER_REGISTRY_PASSWORD}\"|g" ${ENV_PATH}
sed -i -e "s|^IOTHUB_CONNECTION_STRING=.*$|IOTHUB_CONNECTION_STRING=$IOTHUB_CONNECTION_STRING|g" ${ENV_PATH}
sed -i -e "s/^SUBSCRIPTION_ID=.*$/SUBSCRIPTION_ID=${SUBSCRIPTION_ID}/g" ${ENV_PATH}
sed -i -e "s/^RESOURCE_GROUP=.*$/RESOURCE_GROUP=\"${RESOURCE_GROUP}\"/g" ${ENV_PATH}
sed -i -e "s/^TENANT_ID=.*$/TENANT_ID=${TENANT_ID}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_NAME=.*$/SERVICE_NAME=${AMS_NAME}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_PRINCIPAL_APP_ID=.*$/SERVICE_PRINCIPAL_APP_ID=${AMS_SP_ID}/g" ${ENV_PATH}
sed -i -e "s/^SERVICE_PRINCIPAL_SECRET=.*$/SERVICE_PRINCIPAL_SECRET=${AMS_SP_SECRET}/g" ${ENV_PATH}
sed -i -e "s|^CUSTOM_VISION_ENDPOINT=.*$|CUSTOM_VISION_ENDPOINT=${CUSTOM_VISION_ENDPOINT}|g" ${ENV_PATH}
sed -i -e "s/^CUSTOM_VISION_TRAINING_KEY.*$/CUSTOM_VISION_TRAINING_KEY=${CUSTOM_VISION_TRAINING_KEY}/g" ${ENV_PATH}
rm "${ENV_PATH}-e"


printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Choosing deployment template"

echo "$(info) INFERENCE_MODULE_RUNTIME: ${INFERENCE_MODULE_RUNTIME}"
echo "$(info) EDGE_DEVICE_ARCHITECTURE: ${EDGE_DEVICE_ARCHITECTURE}"
echo "$(info) VIDEO_CAPTURE_MODULE:     ${VIDEO_CAPTURE_MODULE}"

MANIFEST_TEMPLATE_BASE_NAME="deployment"

if echo ${INFERENCE_MODULE_RUNTIME} | tr '[:upper:]' '[:lower:]' | grep 'gpu' > /dev/null ; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.gpu"
elif echo ${INFERENCE_MODULE_RUNTIME} | tr '[:upper:]' '[:lower:]' | grep 'nvidia' > /dev/null ; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.gpu"
elif echo ${INFERENCE_MODULE_RUNTIME} | tr '[:upper:]' '[:lower:]' | grep 'vpu' > /dev/null ; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.vpu"
elif echo ${INFERENCE_MODULE_RUNTIME} | tr '[:upper:]' '[:lower:]' | grep 'movidius' > /dev/null ; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.vpu"
else
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_BASE_NAME}.cpu"
fi

if [ "${EDGE_DEVICE_ARCHITECTURE}" == "ARM64" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.arm64v8"
fi

if [ "$VIDEO_CAPTURE_MODULE" == "opencv" ]; then
    MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.opencv"
fi

MANIFEST_TEMPLATE_NAME="${MANIFEST_TEMPLATE_NAME}.template.json"
MANIFEST_TEMPLATE_PATH="${MANIFEST_PATH}/${MANIFEST_TEMPLATE_NAME}"
echo "$(info) Deployment template choosen: ${MANIFEST_TEMPLATE_NAME}"
echo "$(info) Deployment template file path: ${MANIFEST_TEMPLATE_PATH}"
echo "$(pwd)"



printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Removing CR credential if using docker.io."
if echo ${CONTAINER_REGISTRY_NAME} | tr '[:upper:]' '[:lower:]' | grep 'docker.io' > /dev/null ; then
    echo "$(info) Using docker.io. Removing CR credential..."
    cat ${MANIFEST_TEMPLATE_PATH} | \
    jq 'del(.modulesContent."$edgeAgent"."properties.desired".runtime.settings.registryCredentials)' \
    > ${MANIFEST_TEMPLATE_PATH}.tmp
    mv ${MANIFEST_TEMPLATE_PATH}.tmp ${MANIFEST_TEMPLATE_PATH}
fi

printf "\n%60s\n" " " | tr ' ' '-'
echo "$(info) Generating manifest file from template file"
rm -rf config
iotedgedev genconfig --file "${MANIFEST_PATH}/${MANIFEST_TEMPLATE_NAME}"

PRE_GENERATED_MANIFEST_FILENAME="./config/deployment.json"
find ./config -name "*.json" | xargs -I{} mv {} "${PRE_GENERATED_MANIFEST_FILENAME}"

if [ ! -f "${PRE_GENERATED_MANIFEST_FILENAME}" ]; then
    echo "$(error) Manifest file \"${PRE_GENERATED_MANIFEST_FILENAME}\" does not exist."
    echo "Please check config folder under current directory: \"$PWD\" to see if manifest file is generated or not"
    exit 1
fi
az iot edge deployment create \
    --deployment-id "${DEPLOYMENT_NAME}" \
    --hub-name "${IOTHUB_NAME}" \
    --content "${PRE_GENERATED_MANIFEST_FILENAME}" \
    --target-condition "deviceId='${DEVICE_NAME}'" \
    --output "none"
echo "$(info) Deployed manifest file to IoT Hub. Your modules are being deployed to your device now. This may take some time."


# Pass Login since ARM already logged-in with identity.
