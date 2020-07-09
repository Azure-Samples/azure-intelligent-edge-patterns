#!/usr/bin/env bash

#######################################################################################################################
# This script deploys resources in Azure for use with Azure Media Services Live Video Analytics samples.              #
# It is primarily meant to run in https://shell.azure.com/ in the Bash environment. (It will not work in PowerShell.) #
#                                                                                                                     #
# You will need an Azure subscription with permissions for creating service principals (owner role provides this).    #                                                                                                                #
#                                                                                                                     #
# Do not be in the habit of executing scripts from the internet with root-level access to your machine. Only trust    #
# well-known publishers.                                                                                              #
#######################################################################################################################

# colors for formatting the ouput
YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[0;31m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# script configuration
BASE_URL='/home/julia/clouddrive/live-video-analytics-master/live-video-analytics-iot-edge-csharp-master/src/edge/setup' # location of remote files used by the script
DEFAULT_REGION='westus2'
ENV_FILE='edge-deployment/.env'
APP_SETTINGS_FILE='appsettings.json'
ARM_TEMPLATE_URL="$BASE_URL/deploy.json"
DEPLOYMENT_MANIFEST_URL="$BASE_URL/deployment.yolov3.template.json"
DEPLOYMENT_MANIFEST_FILE='edge-deployment/deployment.yolov3.amd64.json'
ROLE_DEFINITION_URL="$BASE_URL/LVAEdgeUserRoleDefinition.json"
ROLE_DEFINITION_FILE='role_definition.json'
RESOURCE_GROUP='teamlvarg'
#APPDATA_FOLDER_ON_DEVICE="\var\local\mediaservices"

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
"
sleep 2 # time for the reader 


#echo "Initialzing output files.
#This overwrites any output files previously generated."
 mkdir -p $(dirname $ENV_FILE) && echo -n "" > $ENV_FILE
 mkdir -p $(dirname $APP_SETTINGS_FILE) && echo -n "" > $APP_SETTINGS_FILE
 mkdir -p $(dirname $DEPLOYMENT_MANIFEST_FILE) && echo -n "" > $DEPLOYMENT_MANIFEST_FILE

# install the Azure CLI IoT extension
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
You will need to use a subscription with permissions for creating service principals (owner role provides this).
${YELLOW}If you want to change to a different subscription, enter the name or id.${NC}
Or just press enter to continue with the current subscription."
read -p ">> " SUBSCRIPTION_ID

if ! test -z "$SUBSCRIPTION_ID"
then 
    az account set -s "$SUBSCRIPTION_ID"
    echo -e "\n${GREEN}Now using:${NC}"
    az account show --query '[name,id]'
fi 

# select a region for deployment. currently, to use LVA, you must use westus2 !!!
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
${YELLOW}What is the name of the resource group to use?${NC}
This will create a new resource group if one doesn't exist.
Hit enter to use the default (${BLUE}${RESOURCE_GROUP}${NC})."
read -p ">> " tmp
RESOURCE_GROUP=${tmp:-$RESOURCE_GROUP}

EXISTING=$(az group exists -g ${RESOURCE_GROUP})

if ! $EXISTING; then
    echo -e "\n${GREEN}The resource group does not currently exist.${NC}"
    echo -e "We will create it in ${BLUE}${REGION}${NC}. Make sure when you set up your ASE device to put it in the same resource group!"
    az group create --name ${RESOURCE_GROUP} --location ${REGION} -o none
    checkForError
fi

# deploy resources using a template
 echo -e "
 Now we'll deploy some resources to ${GREEN}${RESOURCE_GROUP}.${NC}
 This typically takes about 2 minutes, but the time may vary.

# The resources are defined in a template here:
# ${BLUE}${ARM_TEMPLATE_URL}${NC}"

#ROLE_DEFINITION_NAME=$(az deployment group create --resource-group $RESOURCE_GROUP --template-uri $ARM_TEMPLATE_URL --query properties.outputs.roleName.value | tr -d \")
ROLE_DEFINITION_NAME="LVAEdgeUserTest"
#checkForError

# query the resource group to see what has been deployed


# # capture resource configuration in variables
# IOTHUB=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.Devices\/IotHubs$/ {print $1}')
# AMS_ACCOUNT=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.Media\/mediaservices$/ {print $1}')

# CONTAINER_REGISTRY=$(echo "${RESOURCES}" | awk '$2 ~ /Microsoft.ContainerRegistry\/registries$/ {print $1}')
# CONTAINER_REGISTRY_USERNAME=$(az acr credential show -n $CONTAINER_REGISTRY --query 'username' | tr -d \")
# CONTAINER_REGISTRY_PASSWORD=$(az acr credential show -n $CONTAINER_REGISTRY --query 'passwords[0].value' | tr -d \")

echo -e "
Some of the configuration for these resources cant be performed using a template.
So, well handle these for you now:
- set up a service principal (app registration) for the Media Services account
"
#create storage account
STORAGE_ACCOUNT_NAME="teamlvastorage"
EXISTING=$(az storage account check-name -n ${STORAGE_ACCOUNT_NAME} | jq .nameAvailable)
if $EXISTING; then
    STORAGE_ACCOUNT="$(az storage account create -n ${STORAGE_ACCOUNT_NAME} -g ${RESOURCE_GROUP} -l ${REGION} --sku Standard_LRS --kind StorageV2 --access-tier hot)"
    echo "Creating storage account..."
#STORAGE_ACCOUNT_NAME=$(echo "${STORAGE_ACCOUNT"} | jq .name)
#echo "${STORAGE_ACCOUNT_NAME}"
else
    echo "storage account named teamlvastorage already exists"
fi

AMS_ACCOUNT_NAME="teamlvamediaservices"
EXISTING=$(az ams account check-name -l ${REGION} -n ${AMS_ACCOUNT_NAME})
 if [[ "$EXISTING" =~ "Name available." ]]; then
    echo "Creating ams account..."
    AMS_ACCOUNT=$(az ams account create --name ${AMS_ACCOUNT_NAME} --resource-group ${RESOURCE_GROUP}  -l ${REGION} --storage-account ${STORAGE_ACCOUNT_NAME})
 else
     echo "Media services account named teamlvamediaservicesauto already exists!"
 fi

# # this includes everything in the resource group, and not just the resources deployed by the template
#  echo -e "\nResource group now contains these resources:"
#  RESOURCES=$(az resource list --resource-group $RESOURCE_GROUP --query '[].{name:name,"Resource Type":type}' -o table)
#  echo "${RESOURCES}"

 EDGE_DEVICE="EDGE_DEVICE"
# #IOTHUB = "teamlvahub"
# #IOTHUB_CONNECTION_STRING=$(az iot hub show-connection-string --hub-name ${IOTHUB} --query='connectionString')
# # configure the hub for an edge device


# creating the AMS account creates a service principal, so well just reset it to get the credentials
echo "setting up service principal..."
SPN="$AMS_ACCOUNT_NAME-access-sp" # this is the default naming convention used by `az ams account sp`
if test -z "$(az ad sp list --display-name $SPN --query="[].displayName" -o tsv)"; then
    AMS_CONNECTION=$(az ams account sp create -o yaml --resource-group $RESOURCE_GROUP --account-name ${AMS_ACCOUNT_NAME})
    echo "creating new sp ${AMS_CONNECTION}"
else
    AMS_CONNECTION=$(az ams account sp reset-credentials -o yaml --resource-group $RESOURCE_GROUP --account-name ${AMS_ACCOUNT_NAME})
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
    #curl -sL $ROLE_DEFINITION_URL > $ROLE_DEFINITION_FILE
    sed -i "s/\$SUBSCRIPTION_ID/$SUBSCRIPTION_ID/" $ROLE_DEFINITION_URL
    sed -i "s/\$ROLE_DEFINITION_NAME/$ROLE_DEFINITION_NAME/" $ROLE_DEFINITION_URL
    
    #az role definition create --role-definition $ROLE_DEFINITION_URL
    #checkForError
fi
# capture object_id
echo "made it to line 225"
OBJECT_ID=$(az ad sp show --id ${AAD_SERVICE_PRINCIPAL_ID} --query 'objectId' | tr -d \")

# create role assignment
az role assignment create --role "$ROLE_DEFINITION_NAME" --assignee-object-id $OBJECT_ID -o none
echo -e "The service principal with object id ${OBJECT_ID} is now linked with custom role ${BLUE}$ROLE_DEFINITION_NAME${NC}."

# The brand-new AMS account has a standard streaming endpoint in stopped state. 
# A Premium streaming endpoint is recommended when recording multiple days’ worth of video

 echo -e "
 Updating the Media Services account to use one ${YELLOW}Premium${NC} streaming endpoint."
 az ams streaming-endpoint scale --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --scale-units 1

 echo "Kicking off the async start of the Premium streaming endpoint."
 echo "  This is needed to run samples or tutorials involving video playback."
 az ams streaming-endpoint start --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --no-wait

# # write env file for edge deployment
 echo "SUBSCRIPTION_ID=\"$SUBSCRIPTION_ID\"" >> $ENV_FILE
 echo "RESOURCE_GROUP=\"$RESOURCE_GROUP\"" >> $ENV_FILE
 echo "AMS_ACCOUNT=\"$AMS_ACCOUNT\"" >> $ENV_FILE
 echo "AAD_TENANT_ID=$AAD_TENANT_ID" >> $ENV_FILE
 echo "AAD_SERVICE_PRINCIPAL_ID=$AAD_SERVICE_PRINCIPAL_ID" >> $ENV_FILE
 echo "AAD_SERVICE_PRINCIPAL_SECRET=$AAD_SERVICE_PRINCIPAL_SECRET" >> $ENV_FILE
 #echo "INPUT_VIDEO_FOLDER_ON_DEVICE=\"/home/lvaadmin/samples/input\"" >> $ENV_FILE #this would be your local share
# # echo "OUTPUT_VIDEO_FOLDER_ON_DEVICE=\"/home/lvaadmin/samples/output\"" >> $ENV_FILE
# # echo "APPDATA_FOLDER_ON_DEVICE=\"/var/local/mediaservices\"" >> $ENV_FILE
# # echo "CONTAINER_REGISTRY_USERNAME_myacr=$CONTAINER_REGISTRY_USERNAME" >> $ENV_FILE
# # echo "CONTAINER_REGISTRY_PASSWORD_myacr=$CONTAINER_REGISTRY_PASSWORD" >> $ENV_FILE

 echo -e "
 We've generated some configuration files for the deployed resource.
 This .env can be used with the ${GREEN}Azure IoT Tools${NC} extension in ${GREEN}Visual Studio Code${NC}.
 You can find it here:
 ${BLUE}${ENV_FILE}${NC}"

# # write appsettings for sample code
 echo "{" >> $APP_SETTINGS_FILE
 echo "    \"IoThubConnectionString\" : $IOTHUB_CONNECTION_STRING," >> $APP_SETTINGS_FILE
 echo "    \"deviceId\" : \"$EDGE_DEVICE\"," >> $APP_SETTINGS_FILE
 echo "    \"moduleId\" : \"lvaEdge\"" >> $APP_SETTINGS_FILE
 echo -n "}" >> $APP_SETTINGS_FILE

 echo -e "
 The appsettings.json file is for the .NET Core sample application.
 You can find it here and once you create your IoT Hub and device you'll need to replace the values:
 ${BLUE}${APP_SETTINGS_FILE}${NC}"

 echo -e "
 ${GREEN}All done!${NC} \U1F44D\n

 Next, copy these generated files into your local copy of the sample app:
 - ${BLUE}${APP_SETTINGS_FILE}${NC}
 - ${BLUE}${ENV_FILE}${NC}

 Go to ${GREEN}https://aka.ms/lva-edge-quickstart${NC} to learn more about getting started with ${BLUE}Live Video Analytics${NC} on IoT Edge.
 "

# # set up deployment manifest
 curl -s $DEPLOYMENT_MANIFEST_URL > $DEPLOYMENT_MANIFEST_FILE


 sed -i "s/\$SUBSCRIPTION_ID/$SUBSCRIPTION_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$RESOURCE_GROUP/$RESOURCE_GROUP/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AMS_ACCOUNT/$AMS_ACCOUNT/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_TENANT_ID/$AAD_TENANT_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_SERVICE_PRINCIPAL_ID/$AAD_SERVICE_PRINCIPAL_ID/" $DEPLOYMENT_MANIFEST_FILE
 sed -i "s/\$AAD_SERVICE_PRINCIPAL_SECRET/$AAD_SERVICE_PRINCIPAL_SECRET/" $DEPLOYMENT_MANIFEST_FILE


 echo -e "
 You can find the deployment manifest file here:
 - ${BLUE}${DEPLOYMENT_MANIFEST_FILE}${NC}
 "

# # cleanup
# # rm $ROLE_DEFINITION_FILE &> /dev/null
# # rm $CLOUD_INIT_FILE &> /dev/null