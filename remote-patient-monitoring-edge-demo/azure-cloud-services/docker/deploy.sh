#!/usr/bin/env bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

set -ex

templatefile=${1:-'azuredeploy.json'}
location=${2:-'eastus'}
prefix=${3:-'aserpmdemo'}
outputfilename=${4:-'outputs'}

randomstring=$(date | md5sum | head -c 8)
datestamp=$(date +%d%m%y%H%M)

resourcegroupname=$prefix-rg
deploymentname=$prefix-$datestamp-deployment
servicebusname=$prefix$datestamp$randomstring
iothubname=$prefix-$datestamp-$randomstring-iothub
acrname=$prefix$datestamp$randomstring

connectionstringoutputname='servicebus_connectionstring'

function run {
    az group create --resource-group $resourcegroupname --location $location

    az deployment group create \
    --name $deploymentname \
    --template-file $templatefile \
    --parameters \
        param_serviceBus_name=$servicebusname \
        param_iotHub_name=$iothubname \
        param_acr_name=$acrname \
    --resource-group $resourcegroupname
    
}

function output {
    connectionstring=$( \
    az deployment group show \
        --resource-group $resourcegroupname \
        --name $deploymentname \
        --query properties.outputs.$connectionstringoutputname.value \
        --output tsv )


    echo "set -a"
    echo "connection_string='$connectionstring'"
    echo "resourcegroupname='$resourcegroupname'"
    echo "deploymentname='$deploymentname'"
    echo "acrname='$acrname'"
    echo "docker_registry='$acrname.azurecr.io/'"
    echo "iothubname='$iothubname'"
    echo "servicebusname='$servicebusname'"
    echo "set +a"

}

function cleanup {
    az deployment group delete --resource-group $resourcegroupname --name $deploymentname
}

function success {
    set +x
    GREEN='\033[0;32m'
    RESET='\033[0m'
    WHITE='\033[1;37m'
    YELLOW='\033[1;33m'
    echo -e "${GREEN}Azure Cloud Deployment Successful!$RESET"
    echo -e "${WHITE}See outputs file for more info.$RESET"
    echo -e "${YELLOW}Load variables by running 'source outputs'$RESET"
}

run

output > $outputfilename

success





# CLEANUP (for testing purposes)
# function cleanup {
#     az deployment group delete --resource-group $resourcegroupname --name $deploymentname
#     # rm $testfile
# }

# echo "looks like it worked?"

# read -p "press enter to clean up"

# cleanup