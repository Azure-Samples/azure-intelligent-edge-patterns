# #!/usr/bin/env bash
# Last updated August 2020
# #######################################################################################################################
# # This script deploys resources in Azure for use with Azure Media Services Live Video Analytics and runs a sample from the Azure Cloud Shell              #
# # It is  meant to run in https://shell.azure.com/ in the Bash environment. (It will not work in PowerShell.) #
# #                                                                                                                     #
# # You will need an Azure subscription with permissions for creating service principals (owner role provides this).    #                                                                                                                #
# #                                                                                                                     #
# # Do not be in the habit of executing scripts from the internet with root-level access to your machine. Only trust    #
# # well-known publishers.                                                                                              #
# #######################################################################################################################

# colors for formatting the ouput
YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[0;31m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# # script configuration
BASE_URL='https://raw.githubusercontent.com/julialieberman/azure-intelligent-edge-patterns/t-jull-lvasample/Research/lva-ase-sample/src' # location of remote files used by the script
DEFAULT_REGION='westus2'
ENV_FILE='edge-deployment/.env'
APP_SETTINGS_FILE='appsettings.json'
ROLE_DEFINITION_URL="$BASE_URL/setup/LVAEdgeUserRoleDefinition.json"
ROLE_DEFINITION_FILE="LVAEdgeUserRoleDefinition.json"
DEPLOYMENT_MANIFEST_URL="$BASE_URL/deployment.yolov3.template.json"
DEPLOYMENT_MANIFEST_FILE='edge-deployment/deployment.yolov3.template.json'
JSONFILEPATH="$BASE_URL/setup/jsonfiles/"
JSONOUTPUTFILEPATH="jsonfiles/"
HELPER_SCRIPT_URL="$BASE_URL/setup/invokeMethodsHelper.sh"
HELPER_SCRIPT="invokeMethodsHelper.sh"
RESOURCE_GROUP='teamlvarg'

checkForError() {
    if [ $? -ne 0 ]; then
        echo -e "\n${RED}Something went wrong:${NC}
    Please read any error messages carefully.
    After addressing any errors, you can safely run this script again.
    Note:
    - If you rerun the script with the same subscription and resource group,
      it will attempt to continue where it left off.
    - Some problems with Azure Cloud Shell may be restarting from the toolbar:
      https://docs.microsoft.com/azure/cloud-shell/using-the-shell-window#restart-cloud-shell
    "
        exit 1
    fi
}

# let's begin!
echo -e "
Welcome! \U1F9D9\n
This script will set up a number of prerequisite resources so 
that you can run the ${BLUE}Live Video Analytics${NC} samples:
https://github.com/Azure-Samples/live-video-analytics-edge
You should already have an active subscription with owner level permissions, 
an Azure Stack Edge (ASE) setup and connected to an IoT Hub, two compute-enabled SMB shares,
and a storage account. If you haven't already gone through those steps refer back to the 
ASE documentation: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-prep
Then resume this script. 

This script will first create all the necessary resources and files for you to be successful, and then it will deploy modules to your ASE, and run through a series of commands for you 
to visualize output of your first run of Live Video Analytics!
"
sleep 2 # time for the reader 

echo "Initialzing output files.
This overwrites any output files previously generated."

mkdir -p $(dirname $DEPLOYMENT_MANIFEST_FILE) && echo -n "" > $DEPLOYMENT_MANIFEST_FILE
chmod +x ${DEPLOYMENT_MANIFEST_FILE}

# get files for media graph / operations payloads
declare -a jsonOnlineFiles
jsonOnlineFiles=("instanceactivate.json" "instancedelete.json" "instanceset.json" "topologylist.json"
"instancedeactivate.json"  "instancelist.json" "topologydelete.json" "topologyset.json")

for i in "${jsonOnlineFiles[@]}"
do
    mkdir -p $(dirname "${JSONOUTPUTFILEPATH}${i}") && echo -n "" > "${JSONOUTPUTFILEPATH}${i}"
    chmod +x "${JSONOUTPUTFILEPATH}${i}"
    curl -sL "${JSONFILEPATH}${i}" > "${JSONOUTPUTFILEPATH}${i}"
done

# # install the Azure CLI IoT extension
echo -e "Checking for the ${BLUE}azure-iot${NC} cli extension."
az extension show -n azure-iot -o none
if [ $? -ne 0 ]; then
    echo -e "Installing the ${BLUE}azure-iot${NC} cli extension."
    az extension add --name azure-iot &> /dev/null
else
    echo -e "${BLUE}azure-iot${NC} cli extension was found."
fi

# check if we need to log in
# if we are executing in the Azure Cloud Shell, we should already be logged in
az account show -o none
if [ $? -ne 0 ]; then
    echo -e "\nRunning 'az login' for you."
    az login -o none
fi

# query subscriptions
echo -e "\n${GREEN}You have access to the following subscriptions:${NC}"
az account list --query '[].{name:name,"subscription Id":id}' --output table

echo -e "\n${GREEN}Your current subscription is:${NC}"
az account show --query '[name,id]'

echo -e "
You will need to use a subscription with owner level permissions for creating service principals.
${YELLOW}If you want to change to a different subscription, enter the name or id.${NC}
Or just press enter to continue with the current subscription."
read -p ">> " SUBSCRIPTION_ID

if ! test -z "$SUBSCRIPTION_ID"
then 
    az account set -s "$SUBSCRIPTION_ID"
    echo -e "\n${GREEN}Now using:${NC}"
    az account show --query '[name,id]'
fi 

# # select a region for deployment.
echo -e "
${YELLOW}Please select a region to deploy resources from this list, but know that do use LVA as of July 2020 you must use westus2: canadaeast, centralus, eastus2, francecentral, japanwest, northcentralus, switzerlandnorth, uksouth, westcentralus, westus2, eastus2euap, centraluseuap.${NC}
Or just press enter to use ${DEFAULT_REGION}."
read -p ">> " REGION

if [[ "$REGION" =~ ^(canadaeast|centralus|eastus2|francecentral|japanwest|northcentralus|switzerlandnorth|uksouth|westcentralus|westus2|eastus2euap|centraluseuap)$ ]]; then
    echo -e "\n${GREEN}Now using:${NC} $REGION"
else
    echo -e "\n${GREEN}Defaulting to:${NC} ${DEFAULT_REGION}"
    REGION=${DEFAULT_REGION}
fi


# choose a resource group
echo -e "
${YELLOW}What is the name of the resource group to use? This should be the same one where you put your Azure Stack Edge Device${NC}
."
read -p ">> " tmp
RESOURCE_GROUP=${tmp:-$RESOURCE_GROUP}

EXISTING=$(az group exists -g ${RESOURCE_GROUP})

while ! $EXISTING
do
    echo -e "\n${GREEN}The resource group does not currently exist.${NC}"
    echo -e "\n${RED}Please go back and verify the name of your resource group that contains your ASE. What is the correct name? ${NC}"
    read -p ">> " tmp
    RESOURCE_GROUP=${tmp:-$RESOURCE_GROUP}
    EXISTING=$(az group exists -g ${RESOURCE_GROUP})
done

echo -e "\nResource group currently contains these resources:"
RESOURCES=$(az resource list --resource-group $RESOURCE_GROUP --query '[].{name:name,"Resource Type":type}' -o table)
echo "${RESOURCES}"

IOTHUB=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.Devices\/IotHubs$/ {print $1}')
EDGE_DEVICE=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.DataBoxEdge\/DataBoxEdgeDevices$/ {print $1}')

if test -z "$EDGE_DEVICE"
then
    echo "\n${RED}Azure Stack Edge device not found in resource group. Please go make sure you have set it up in the same resource group, then run this script again.${NC}"
    exit 1
else
    echo -e "\nFound the following Azure Stack Edge device, hit enter to use this, otherwise provide the name of the correct device(${BLUE}${EDGE_DEVICE}${NC})."
    read -p ">> " tmp
    EDGE_DEVICE=${tmp:-$EDGE_DEVICE}
    FOUND=$(az resource show -n ${EDGE_DEVICE} --resource-type "Microsoft.DataBoxEdge/DataBoxEdgeDevices" -g ${RESOURCE_GROUP} --query 'name')
    if ! [[ "$FOUND" =~ "$EDGE_DEVICE" ]]; 
    then
        echo "\n${RED}Device not found. Please go back and make sure you have the correct device setup and name! Then run this script again.${NC}"
        exit 1
    fi
fi

if test -z "$IOTHUB"
then 
    echo "\n${RED}IoTHub not found, please go make sure you have enabled compute on your ASE device, then run this script again.${NC}"
    exit 1
fi

# #Check there is already a valid storage account
STORAGE_ACCOUNT=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.Storage\/storageAccounts$/ {print $1}')
if test -z "$STORAGE_ACCOUNT"
then 
    echo "\n${RED}No storage account found, please go make sure you have gone through setting up a share on your ASE device, then run this script again.${NC}"
    exit 1
fi

echo -e "
${YELLOW}What is the name of the storage account to use? Make sure to use the same one associated with your shares. We found ${STORAGE_ACCOUNT} in your resource group${NC}
Hit enter to use the one found (${BLUE}${STORAGE_ACCOUNT}${NC})."
read -p ">> " tmp
STORAGE_ACCOUNT=${tmp:-$STORAGE_ACCOUNT}
AVAILABLE=$(az storage account check-name -n ${STORAGE_ACCOUNT} | jq .nameAvailable)
if $AVAILABLE; then
    echo "\n${RED}That storage account was not found. Please go check the name of the one you would like to use, and run this script again.${NC}"
    exit 1
fi

# deploy resources
 echo -e "
 Now we will deploy some resources to ${GREEN}${RESOURCE_GROUP}.${NC}
 Including a container registry, and a media services account."

ROLE_DEFINITION_NAME="LVAEdgeUsertest"

#create or find container registry
CONTAINER_REGISTRY=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.ContainerRegistry\/registries$/ {print $1}')
if ! test -z "$CONTAINER_REGISTRY"
then
    echo -e "
    ${YELLOW}Found existing container registry called: ${CONTAINER_REGISTRY}. This will be used by default unless otherwise specified"
else
    UUID=$(cat /proc/sys/kernel/random/uuid)
    CONTAINER_REGISTRY="teamlvacontainerregistry-"$UUID
fi

echo -e "
${YELLOW}What is the name of the container registry to use?${NC}
This will create a new one if one doesn't exist.
Hit enter to use the default (${BLUE}${CONTAINER_REGISTRY}${NC})."
read -p ">> " tmp
CONTAINER_REGISTRY=${tmp:-$CONTAINER_REGISTRY}

AVAILABLE=$(az acr check-name -n ${CONTAINER_REGISTRY} | jq .nameAvailable)
FOUND=$(az resource list --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_REGISTRY} --query='[].name' -o tsv)

while test -z "$FOUND" && ! $AVAILABLE
do
    echo "That name is either unavailable or not in your resource group. Please enter a new name. Note that it must be more than 5 characters: "
    read -p ">> " tmp
    CONTAINER_REGISTRY=${tmp:-$CONTAINER_REGISTRY}
    AVAILABLE=$(az acr check-name -n ${CONTAINER_REGISTRY} | jq .nameAvailable)
    FOUND=$(az resource list --resource-group ${RESOURCE_GROUP} --name ${CONTAINER_REGISTRY} --query='[].name' -o tsv)
done

if ! $AVAILABLE; then
    echo "Container registry already exists... gathering credentials for you"
else
    echo "Creating a new container registry called ${CONTAINER_REGISTRY}!"
    az acr create -g ${RESOURCE_GROUP} -n ${CONTAINER_REGISTRY} -l ${REGION} --sku Basic --admin-enabled true
fi

# #Get container registry credentials
CONTAINER_REGISTRY_USERNAME=$(az acr credential show -n $CONTAINER_REGISTRY --query 'username' | tr -d \")
CONTAINER_REGISTRY_PASSWORD=$(az acr credential show -n $CONTAINER_REGISTRY --query 'passwords[0].value' | tr -d \")

#create or find existing media services account
AMS_ACCOUNT=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.Media\/mediaservices$/ {print $1}')

if ! test -z "$AMS_ACCOUNT"
then
    echo -e "
    ${YELLOW}Found existing Media Services Account called: ${AMS_ACCOUNT}. This will be used by default unless otherwise specified"
else
    UUID=$(cat /proc/sys/kernel/random/uuid | tr -dc '[:alnum:]\n\r' | tr '[:upper:]' '[:lower:]' | sed 's/[0-9]*//g')
    AMS_ACCOUNT="teamlvamediaservices"-$UUID
fi
echo -e "
${YELLOW}What is the name of the media services account to use?${NC}
This will create a new one if one doesn't exist. Make sure the name is composed of all lowercase letters.
Hit enter to use the default (${BLUE}${AMS_ACCOUNT}${NC})."
read -p ">> " tmp
AMS_ACCOUNT=${tmp:-$AMS_ACCOUNT}

EXISTING=$(az ams account check-name -l ${REGION} -n ${AMS_ACCOUNT})
FOUND=$(az resource list --resource-group ${RESOURCE_GROUP} --name ${AMS_ACCOUNT} --query='[].name' -o tsv)

while ! [[ "$EXISTING" =~ "Name available." ]] && test -z "$FOUND"
do
    echo "That name is either unavailable or not in your resource group. Please enter a new name: "
    read -p ">> " tmp
    AMS_ACCOUNT=${tmp:-$AMS_ACCOUNT}
    EXISTING=$(az ams account check-name -l ${REGION} -n ${AMS_ACCOUNT})
    FOUND=$(az resource list --resource-group ${RESOURCE_GROUP} --name ${AMS_ACCOUNT} --query='[].name' -o tsv)
done

if [[ "$EXISTING" =~ "Name available." ]]; then
    echo "Creating new AMS account named ${AMS_ACCOUNT}"
    AMS_ACCOUNT=$(az ams account create --name ${AMS_ACCOUNT} --resource-group ${RESOURCE_GROUP}  -l ${REGION} --storage-account ${STORAGE_ACCOUNT})
else
    echo "Using existing Media services account named ${AMS_ACCOUNT}!"
fi


echo -e "\nResource group now contains these resources:"
RESOURCES=$(az resource list --resource-group $RESOURCE_GROUP --query '[].{name:name,"Resource Type":type}' -o table)
echo "${RESOURCES}"

# creating the AMS account creates a service principal, so well just reset it to get the credentials
echo "setting up service principal..."
SPN="$AMS_ACCOUNT-access-sp" # this is the default naming convention used by `az ams account sp`
if test -z "$(az ad sp list --display-name $SPN --query="[].displayName" -o tsv)"; then
    AMS_CONNECTION=$(az ams account sp create -o yaml --resource-group $RESOURCE_GROUP --account-name ${AMS_ACCOUNT})
    echo "creating new sp ${AMS_CONNECTION}"
else
    AMS_CONNECTION=$(az ams account sp reset-credentials -o yaml --resource-group $RESOURCE_GROUP --account-name ${AMS_ACCOUNT})
fi

# capture config information
re="AadTenantId:\s([0-9a-z\-]*)"
AAD_TENANT_ID=$([[ "$AMS_CONNECTION" =~ $re ]] && echo ${BASH_REMATCH[1]})

re="AadClientId:\s([0-9a-z\-]*)"
AAD_SERVICE_PRINCIPAL_ID=$([[ "$AMS_CONNECTION" =~ $re ]] && echo ${BASH_REMATCH[1]})

re="AadSecret:\s([0-9a-z\-]*)"
AAD_SERVICE_PRINCIPAL_SECRET=$([[ "$AMS_CONNECTION" =~ $re ]] && echo ${BASH_REMATCH[1]})

re="SubscriptionId:\s([0-9a-z\-]*)"
SUBSCRIPTION_ID=$([[ "$AMS_CONNECTION" =~ $re ]] && echo ${BASH_REMATCH[1]})

# create new role definition in the subscription
if test -z "$(az role definition list -n "$ROLE_DEFINITION_NAME" | grep "roleName")"; then
    echo -e "Creating a custom role named ${BLUE}$ROLE_DEFINITION_NAME${NC}."
    curl -sL $ROLE_DEFINITION_URL > $ROLE_DEFINITION_FILE
    sed -i "s/\$SUBSCRIPTION_ID/$SUBSCRIPTION_ID/" $ROLE_DEFINITION_FILE
    sed -i "s/\$ROLE_DEFINITION_NAME/$ROLE_DEFINITION_NAME/" $ROLE_DEFINITION_FILE
    
    az role definition create --role-definition $ROLE_DEFINITION_FILE
    checkForError
fi
# capture object_id

OBJECT_ID=$(az ad sp show --id ${AAD_SERVICE_PRINCIPAL_ID} --query 'objectId' | tr -d \")

# create role assignment
az role assignment create --role "$ROLE_DEFINITION_NAME" --assignee-object-id $OBJECT_ID -o none
echo -e "The service principal with object id ${OBJECT_ID} is now linked with custom role ${BLUE}$ROLE_DEFINITION_NAME${NC}."

#The brand-new AMS account has a standard streaming endpoint in stopped state. 
#A Premium streaming endpoint is recommended when recording multiple days’ worth of video

echo -e "
Updating the Media Services account to use one ${YELLOW}Premium${NC} streaming endpoint. There is a standard streaming endpoint by default in stopped state."
EXISTING=$(az ams streaming-endpoint list --account-name ${AMS_ACCOUNT} --resource-group ${RESOURCE_GROUP} --query '[].name')
if ! [[ "$EXISTING" =~ "default" ]]; then
    echo "Scaling new endpoint"
    az ams streaming-endpoint scale --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --scale-units 1
fi

 echo "Kicking off the async start of the Premium streaming endpoint. This is needed to run samples or tutorials involving video playback. Occasionally this command throws errors. If that happens, no worries.
 When the script is done running, run the command from your cloud shell:
    az ams streaming-endpoint start --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --no-wait"

az ams streaming-endpoint start --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --no-wait

echo -e "
${YELLOW}What is the name of the input video folder on the device to use? This should be your local share with the sample video${NC}"
read -p ">> " tmp
INPUT_VIDEO_FOLDER_ON_DEVICE=${tmp:-$INPUT_VIDEO_FOLDER_ON_DEVICE}

echo -e "
${YELLOW}What is the name of the output video folder on the device to use? This is where output files will be placed. Make sure it points to a share!${NC}"
read -p ">> " tmp
OUTPUT_VIDEO_FOLDER_ON_DEVICE=${tmp:-$OUTPUT_VIDEO_FOLDER_ON_DEVICE}

echo -e "
${YELLOW}What is the name of the app data video folder on the device to use? This is where output files will be placed. Make sure it points to a share!${NC}"
read -p ">> " tmp
APPDATA_FOLDER_ON_DEVICE=${tmp:-$APPDATA_FOLDER_ON_DEVICE}

#set up deployment manifest
curl -s $DEPLOYMENT_MANIFEST_URL > $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$SUBSCRIPTION_ID/$SUBSCRIPTION_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$RESOURCE_GROUP/$RESOURCE_GROUP/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AMS_ACCOUNT/$AMS_ACCOUNT/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_TENANT_ID/$AAD_TENANT_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_SERVICE_PRINCIPAL_ID/$AAD_SERVICE_PRINCIPAL_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_SERVICE_PRINCIPAL_SECRET/$AAD_SERVICE_PRINCIPAL_SECRET/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$CONTAINER_REGISTRY_USERNAME_myacr/$CONTAINER_REGISTRY_USERNAME_myacr/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$CONTAINER_REGISTRY_PASSWORD_myacr/$CONTAINER_REGISTRY_PASSWORD_myacr/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$INPUT_VIDEO_FOLDER_ON_DEVICE/$INPUT_VIDEO_FOLDER_ON_DEVICE/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$OUTPUT_VIDEO_FOLDER_ON_DEVICE/$OUTPUT_VIDEO_FOLDER_ON_DEVICE/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$APPDATA_FOLDER_ON_DEVICE/$APPDATA_FOLDER_ON_DEVICE/" $DEPLOYMENT_MANIFEST_FILE
 echo -e "
 ${GREEN}All done!${NC} \U1F44D\n
    Next, we will deploy modules to your device (including the Live Video Analytics module, an RTSP module, and a YoloV3 AI inferencing module!)
    using the deployment manifest generated here, found here:
         - ${BLUE}${DEPLOYMENT_MANIFEST_FILE}${NC}

 Go to ${GREEN}https://aka.ms/lva-edge-quickstart${NC} to learn more about getting started with ${BLUE}Live Video Analytics${NC} on IoT Edge.
 "

EDGE_DEVICE="${EDGE_DEVICE}-edge"

modules=$(jq '.modulesContent."$edgeAgent"."properties.desired".modules' $DEPLOYMENT_MANIFEST_FILE)
echo "Found the following modules to be deployed: "
modules=$(echo $modules | jq -j 'keys | @sh' | tr -d "'")
for i in $modules
do
    echo $i
done
echo "Deploying modules now..."

# deploy!!!
az iot edge set-modules --hub-name ${IOTHUB} --device-id ${EDGE_DEVICE} --content $DEPLOYMENT_MANIFEST_FILE

IOTHUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name ${IOTHUB} --query='connectionString' | tr -d "\"")

lvaState=$(az iot hub module-twin show --device-id ${EDGE_DEVICE} --module-id lvaEdge --hub-name ${IOTHUB} --login ${IOTHUB_CONNECTION_STRING} | jq .properties.reported.State)

#wait for modules to deploy successfully - may need more time
sleep 2
# ensure lvaEdge module is in State "Running"
lvaState=$(az iot hub module-twin show --device-id ${EDGE_DEVICE} --module-id lvaEdge --hub-name ${IOTHUB} --login "${IOTHUB_CONNECTION_STRING}")
echo "lvaEdge module is in State:"
echo $lvaState | jq .properties.reported.State

#install helper
mkdir -p $(dirname "${HELPER_SCRIPT}") && echo -n "" > ${HELPER_SCRIPT}
chmod +x $HELPER_SCRIPT
curl -sL ${HELPER_SCRIPT_URL} > ${HELPER_SCRIPT}

echo "Now we will invoke methods on the lvaEdge module, which runs the sample program"
source invokeMethodsHelper.sh $IOTHUB $EDGE_DEVICE $IOTHUB_CONNECTION_STRING

echo "Congratulations, you have successfully run LVA on the ASE!"

echo -e "You can run the program again without rerunning this whole script. To do so, in the same Azure Cloud Shell, run the command 
${YELLOW}./invokeMethodsHelper.sh ${IOTHUB} ${EDGE_DEVICE} \"${IOTHUB_CONNECTION_STRING}\"${NC}

If you would like to change the media graph you create, look through the jsonfiles folder and modify as you see fit. Modify topologyset.json to modify the media graph itself. Modify instanceset.json to change the rtsp URL to point to an actual stream instead of a simulated video.
"