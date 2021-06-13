# This script downloads necessary resources to run the LPR sample automatically on the ASE using LVA
# Prerequisites: Successfully finished the YoloV3 sample

BASE_URL='https://raw.githubusercontent.com/julialieberman/azure-intelligent-edge-patterns/t-jull-lprsample/Research/lva-ase-lpr-sample'
ENV_FILE='edge-deployment/.env'
JSONFILEPATH="$BASE_URL/jsonFiles/"
JSONOUTPUTFILEPATH="jsonFiles/"
DEPLOYMENT_MANIFEST_URL="$BASE_URL/sampledeployment.lpr.template.json"
DEPLOYMENT_MANIFEST_FILE='sampledeployment.lpr.template.json'

# Helper script that invokes direct methods on the lvaEdge module
HELPER_SCRIPT="invokeMethodsHelper.sh"

mkdir -p $(dirname $DEPLOYMENT_MANIFEST_FILE) && echo -n "\"" > $DEPLOYMENT_MANIFEST_FILE
chmod +x ${DEPLOYMENT_MANIFEST_FILE}
curl -s $DEPLOYMENT_MANIFEST_URL > $DEPLOYMENT_MANIFEST_FILE

# Instead of prompting user for values again, gather from .env file formed in YoloV3 sample
# User must have updated the CONTAINER_REGISTRY_USERNAME_myacr and CONTAINER_REGISTRY_PASSWORD_myacr to use Mahesh's ACR!
source $ENV_FILE

# replace values in helper script to use updated method payloads
sed -i "s/instanceSet/lprInstanceSet/" $HELPER_SCRIPT
sed -i "s/topologySet/lprTopologySet/" $HELPER_SCRIPT
sed -i "s/topologyDelete/lprTopologyDelete/" $HELPER_SCRIPT

# get updated files for media graph / instance payloads
declare -a jsonOnlineFiles
jsonOnlineFiles=("lprInstanceSet.json" "lprTopologySet.json" "lprTopologyDelete")

# Download files
for i in "${jsonOnlineFiles[@]}"
do
    mkdir -p $(dirname "${JSONOUTPUTFILEPATH}${i}") && echo -n "" > "${JSONOUTPUTFILEPATH}${i}"
    chmod +x "${JSONOUTPUTFILEPATH}${i}"
    curl -sL "${JSONFILEPATH}${i}" > "${JSONOUTPUTFILEPATH}${i}"
done

# replace the four variables that come with slashes. Without doing this, things break! All special characters must be escaped
PASSWORD_WITH_SLASHES=$(echo $CONTAINER_REGISTRY_PASSWORD_myacr | sed 's/\//\\\//g')
OUTPUT_WITH_SLASHES=$(echo $OUTPUT_VIDEO_FOLDER_ON_DEVICE | sed 's/\//\\\//g')
INPUT_WITH_SLASHES=$(echo $INPUT_VIDEO_FOLDER_ON_DEVICE | sed 's/\//\\\//g')
APPDATA_WITH_SLASHES=$(echo $APPDATA_FOLDER_ON_DEVICE | sed 's/\//\\\//g')

# Fill placeholder values in deployment manifest file with values from .env file
sed -i "s/\$SUBSCRIPTION_ID/$SUBSCRIPTION_ID/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$RESOURCE_GROUP/$RESOURCE_GROUP/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$AMS_ACCOUNT/$AMS_ACCOUNT/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$AAD_TENANT_ID/$AAD_TENANT_ID/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$AAD_SERVICE_PRINCIPAL_ID/$AAD_SERVICE_PRINCIPAL_ID/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$AAD_SERVICE_PRINCIPAL_SECRET/$AAD_SERVICE_PRINCIPAL_SECRET/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$CONTAINER_REGISTRY_USERNAME_myacr/$CONTAINER_REGISTRY_USERNAME_myacr/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$CONTAINER_REGISTRY_PASSWORD_myacr/$PASSWORD_WITH_SLASHES/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$INPUT_VIDEO_FOLDER_ON_DEVICE/$INPUT_WITH_SLASHES/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$OUTPUT_VIDEO_FOLDER_ON_DEVICE/$OUTPUT_WITH_SLASHES/" $DEPLOYMENT_MANIFEST_FILE
sed -i "s/\$APPDATA_FOLDER_ON_DEVICE/$APPDATA_WITH_SLASHES/" $DEPLOYMENT_MANIFEST_FILE


# deploy!!!
az iot edge set-modules --hub-name $IOTHUB --device-id $EDGE_DEVICE --content $DEPLOYMENT_MANIFEST_FILE

echo -e "Now you will need to wait for the deployment to finish successfully. This can take up to 30 minutes, so check the status of your module in the Azure Portal.
Once it is ready, go ahead and run the command ./invokeMethodsHelper.sh to finish up!"
