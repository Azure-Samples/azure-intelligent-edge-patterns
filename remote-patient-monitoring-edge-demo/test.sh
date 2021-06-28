#!/usr/bin/env bash

################################################################################
# IMPORTANT - READ ME
#
# Use at your own risk! 
#
# This is a developer tool for performing end-to-end tests of this solution.
# Some usage instruction is included, but YOU are responsible for understanding
#   what this script does and how to use it appropriately.
# You should also be willing and able to modify this to fit your own purposes.
# If you are not able to understand what this code is doing, you should probably 
#  not use it.
# This script will delete and create things in the cloud, in k8s, and on your 
#  filesystem.
# There are probably bugs and unexpected corner cases you will need to deal with.
#
# You have been warned ;)
#
################################################################################

# USAGE: 

# You should always `az login` before running this script or Azure related tasks won't work.

# Do everything from scratch. Create new Azure Services, Use ACR, build images from source and send in some data.
# ./test.sh deploy withACR withAzure generateData

# Generate some fake data (this will throw errors on the second run, but will still work)
# ./test.sh generateData

# Use ACR and build images from source (but don't create Azure) - Use this if just updating images
# ./test.sh deploy withACR

# To create Azure Services before building and deploying (but don't auth to ACR) - Use this if using default docker hub option
# ./test.sh deploy withAzure

# To JUST deploy - without Azure or ACR. Use this if you already created Azure service and have an outputs file.
# ./test.sh deploy

# Clean everything up. This will delete your deployment. This may throw errors, but will still work. Azure clean up does not work well btw.
# ./test.sh cleanup

set -e

# Pretty Colors
GREEN='\033[0;32m'; LGREEN='\033[01;32m'; WHITE='\033[1;37m'; YELLOW='\033[1;33m'
BLUE='\033[00;34m'; CYAN='\033[00;36m'; PURPLE='\033[00;35m'; RED='\033[00;31m'
RESET='\033[0m'

OPTIONS="$@"
THIS="$0"

function printtime {
    date
}

function cowsayswhat {
    # If cowsay is installed, great. If not, cat.
    # You could swap in other output coolness like lolcat or fortune
    set +e
    which cowsay > /dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        cowsay=' cowsay'
    else
        echo -e "${RED} You should really install cowsay${RESET}"
        echo -e "${WHITE}$ brew install cowsay${RESET}"
        cowsay=' cat'
    fi
    set -e
}

function deploy {
    if [[ "$OPTIONS" == *"withAzure"* ]]; then
        echo -e "${BLUE} Configuring Azure Cloud..." | $cowsay
        printtime
        cd azure-cloud-services
        bicep build azuredeploy.bicep # This is here in case of bicep changes. automated docker deploy only uses the arm template
        ./docker/run.sh deploy
        source outputs
        cd -
        # TODO: make it so you don't have to cd
    fi

    source ./azure-cloud-services/outputs

    if [[ "$OPTIONS" == *"withACR"* ]]; then
        source ./azure-cloud-services/outputs
        helm_set_docker_registry='--set global.docker_registry=$docker_registry'

        echo -e "${WHITE} Authenticating to ACR and k8s..." | $cowsay
        printtime
        ./azure-cloud-services/setup-auth.sh $docker_registry

        echo -e "${YELLOW} Building containers..." | $cowsay
        printtime
        docker-compose build

        echo -e "${LGREEN} Pushing containers..." | $cowsay
        printtime
        docker-compose push
    else
        echo -e "${RED} Clearing \$docker_registry. Using images in docker hub. See ./helm/values.yml" 
        unset docker_registry # Clear docker_registry here so the default in ./helm/values.yml is used
        unset helm_set_docker_registry
    fi

    echo -e "${GREEN} Depoying to k8s with helm" | $cowsay
    printtime
    helm dependency update helm
    helm upgrade --install --recreate-pods everything helm \
        --set global.service_bus_connection_string=$connection_string \
        $helm_set_docker_registry
}

function cleanup {
    source ./azure-cloud-services/outputs

    echo -e "${LGREEN} Cleaning up Helm${RESET}" 
    helm delete everything
    rm -f helm/charts/*.tgz

    echo -e "${LGREEN} Cleaning up k8s secret${RESET}" 
    kubectl delete secrets acr-secret

    echo -e "${LGREEN} Cleaning up Azure${RESET}" 
    az deployment group delete --resource-group $resourcegroupname --name $deploymentname
}

function generateData {
    source ./azure-cloud-services/outputs

    echo -e "${PURPLE} Setting up data generator..." | $cowsay

    cd data-generator
    # These commands will error when run a second time, but thats ok.
    ./create-new-device.sh $iothubname testdevice
    ./setup-environment.sh $iothubname testdevice

    npm install
    npm run build

    echo -e "${PURPLE} Generating some fake data..." | $cowsay

    echo -e "${PURPLE} 2 Worsening Patients, 5 days, to iothub ."    
    npm run addPatientsWithObservations -- -d iothub --numberOfPatients 2 -t worsening --numberOfDays 5
}

function printDashboardLink {
    set +x
    dashboardIP=$(kubectl get services dashboard-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}{"\n"}')

    echo -e "${LGREEN}Click here to view your dashboard:${RESET}"
    echo -e "${GREEN} http://${dashboardIP} ${RESET}"
    set -x
}

cowsayswhat

if [[ "$OPTIONS" == *"deploy"* ]]; then
    set -x
    deploy
    set +x

    echo -e "${CYAN} Deployment complete! \n Check your pods.${RESET}" | $cowsay
    echo -e "\n"

    set -x
    kubectl get pods
    set +x

    echo -e "\n To clean up run ${RED} ${THIS} cleanup${RESET} \n"

    printDashboardLink
fi


if [[ "$OPTIONS" == *"cleanup"* ]]; then
    set +ex
    cleanup
    set -ex
fi

if [[ "$OPTIONS" == *"generateData"* ]]; then
    set +ex
    if [[ "$OPTIONS" == *"deploy"* ]]; then
        waittime=10
        echo -e "${WHITE} Waiting $waittime secs for deploy to finish..."
        sleep $waittime
    fi
    generateData
    set -ex

    printDashboardLink
fi

