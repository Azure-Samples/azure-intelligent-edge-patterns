#!/bin/bash
# @ECHO OFF
AZURE_CORE_NO_COLOR=
AZURE_CORE_ONLY_SHOW_ERRORS=True

# Many of the az commands return output containing carriage returns that must be removed
CR=$'\r'
# ARM deployment script for Custom Vison solution (Free SKU)
customVisionArm=deploy-custom-vision-arm.json
# edge-deployment-json is the template, 
#edgeDeploymentJson=deployment.amd64.json
# edge-deploy-json is the deployment description with keys and endpoints added
edgeDeployJson=deploy.modules.json
# the solution resource group name
rgName=visiononedge-rg


# azSubscriptonName = The friendly name of the Azure subscription
# iotHubName = The IoT Hub that corisponds to the ASE device
# edgeDeviceId = The device id of the ASE device
# cvTrainingApiKey = The Custom Vision service training key
# cvTrainingEndpoint = The Custom Vision service end point
# cpuGpu = CPU or GPU deployment

# SETLOCAL ENABLEDELAYEDEXPANSION

# ############################## Install Prereqs ##############################  

echo Installing / updating the IoT extension
az extension add --name azure-iot

if [ ! $? -eq 0 ]; then
  # Azure CLI is not installed.  It has an MSI installer on Windows, or is available over REST.
  echo
  echo It looks like Azure CLI is not installed.  Please install it from: 
  echo https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest
  echo and try again
  read -p "Press any key to exit..."
  exit 1
fi

################################ Get Tenant ###################################
# remove the header and ---- from output list - start good var data at var1
COLUMNS=1
outputarrten=()
echo Logging on to Azure...
output=$(az login -o table --query [].name --only-show-errors) 
let cnt=0
while IFS=' ' read -r line
do
 if [ $cnt -gt 1 ]; then
    outputarrten+=("$line")
 fi
 let cnt++
done <<< "$output"

# get length of an array
tLen=${#outputarrten[@]}

PS3='Choose the number corisponding to your tenant: '
select opt in "${outputarrten[@]}"
do
  # remove carriage return
  azSubscriptonName=${opt%$CR}
  echo you chose: $azSubscriptonName
  break
done
az account set --subscription "$azSubscriptonName" --only-show-errors

################################ Install Custom Vision ###########################

echo You can use your existing Custom Vision service, or create a new one
  while true; do
    read -p "Would you like to use an existing Custom Vision Service? (y or n): " -n 1 -r; echo
    case $REPLY in
        [Yy]* ) read -p "Please enter your Custom Vision endpoint: " cvTrainingEndpoint; echo
                read -p "Please enter your Custom Vision Key: " cvTrainingApiKey; echo
                if [[ -z $cvTrainingEndpoint ]]; then
                    cvTrainingEndpoint='<Training_Endpoint>'
                fi
                if [[ -z $cvTrainingApiKey ]]; then
                    cvTrainingApiKey='<Training_API_Key>'
                fi
                break;;
        [Nn]* ) cvTrainingEndpoint=""; break;;
        * ) echo "Please answer yes or no.";;
    esac
  done

if [ "$cvTrainingEndpoint" == "" ]; then
  echo Installing the Custom Vision Service
  echo
  loc=()
  loc+=("eastus")
  loc+=("westus2")
  loc+=("southcentralus")
  loc+=("northcentralus")

  PS3='Choose the location: '
  select opt in "${loc[@]}"
  do
      echo "you chose: " $opt
      location=${opt%$CR}
      break
  done

  echo Creating resource group - $rgName
  output=$(az group create -l $location -n $rgName)

  echo Creating Custom Vision Service

  outputarrcv=()
  # Need to note in the documentation that only one free service per subscription can be created.  An existing one results in an error.
  output="$(az deployment group create --resource-group $rgName --template-file $customVisionArm --query properties.outputs.*.value -o table --parameters "{ 'location': { 'value': '$location' } }")"
  let cnt=0
  while read -r line
  do
  if [ $cnt -gt 1 ]; then
      outputarrcv+=("$line")
  fi
  let cnt++
  done <<< "$output"

  # get length of an array
  tLen=${#outputarrcv[@]}

  if [ $tLen -eq 0 ]; then
    echo
    echo Deployment failed.  Please check if you already have a free version of Custom Vision installed.
    read -p "Press <Enter> key to exit..."
    exit 1
  fi

  # the Custom Vision variables
  cvTrainingApiKey=${outputarrcv[0]}
  cvTrainingEndpoint=${outputarrcv[1]}
 
  echo API Key: $cvTrainingApiKey
  echo Endpoint: $cvTrainingEndpoint
fi


# ############################## Get IoT Hub #####################################

echo listing IoT Hubs
outputhubs=$(az iot hub list --only-show-errors -o table --query [].name) 
outputarrhubs=()
let cnt=0
while read -r line
do
 if [ $cnt -gt 1 ]; then
    outputarrhubs+=("$line")
 fi
 let cnt++
done <<< "$outputhubs"

# get length of an array
tLen=${#outputarrhubs[@]}

if [ $tLen -le 0 ]; then
  echo IoTHub not found
  echo Sorry, this demo requires that you have an existing IoTHub and registered Azure Stack Edge Device
  read -p "Press <Enter> key to exit..."; echo
  exit 1
fi
# Only one option so no need to prompt for choice
if [ $tLen -le 1 ]; then
  while true; do
    read -p "please confirm install to ${outputarrhubs[0]%$CR} hub (y or n): " -n 1 -r;echo
    case $REPLY in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
  done
  iotHubName=${outputarrhubs[0]%$CR}
else
  PS3='Choose the number corisponding to the IoTHub managing your target edge device: '
  select opt in "${outputarrhubs[@]}"
  do
    echo "you chose: " $opt
    iotHubName=${opt%$CR}
    break
  done
fi

# ############################## Get Device #####################################

echo getting devices
# query parameter retrieves only edge devices
output=$(az iot hub device-identity list -n $iotHubName -o table --query [?capabilities.iotEdge].[deviceId])
let cnt=0
outputarrdevs=()
while read -r line
do
  # strip off column name and -------
 if [ $cnt -gt 1 ]; then
    outputarrdevs+=("$line")
 fi
 let cnt++
done <<< "$output"

# get length of an array
tLen=${#outputarrdevs[@]}

if [ $tLen -le 0 ]; then
  echo No edge device found
  echo Sorry, this demo requires that you have an existing IoTHub and registered Azure Stack Edge Device
  read -p "Press any key to exit..."; echo
  exit 1
fi
# Only one option so no need to prompt for choice
if [ $tLen -le 1 ]; then
  while true; do
    read -p "please confirm install to ${outputarrdevs[0]%$CR} device (y or n): " -n 1 -r;echo
    case $REPLY in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
  done
  edgeDeviceId=${outputarrdevs[0]%$CR}
else
  PS3='Choose the number corisponding to the Azure Stack Edge device: '
  select opt in "${outputarrdevs[@]}"
  do
    echo "you chose: " $opt
    edgeDeviceId=${opt%$CR}
    break
  done
fi

################################ Check for GPU ###########################################
while true; do
  read -p "Does your device have a GPU? (y or n): " -n 1 -r; echo
  case $REPLY in
      [Yy]* ) cpuGpu="gpu"; runtime="nvidia"; break;;
      [Nn]* ) cpuGpu="cpu"; runtime="runc"  ; break;;
      * ) echo "Please answer yes or no.";;
  esac
done

################################ Check for Platform ###########################################
echo 1 amd64
echo 2 arm64v8
read -p "Choose the platform you're going to deploy: "
if [ "$REPLY" == "2" ]; then
    edgeDeploymentJson=deployment.arm64v8.json
else
    edgeDeploymentJson=deployment.amd64.json
fi

################################ Write Config ############################################

# Will overwrite file if it already exists
input="./$edgeDeploymentJson"
while read -r line
do
    prtline=${line//'<Training Endpoint>'/$cvTrainingEndpoint}
    prtline=${prtline//'<Training API Key>'/$cvTrainingApiKey}
    prtline=${prtline//'<cpu or gpu>'/$cpuGpu}
    prtline=${prtline//'<Docker Runtime>'/$runtime}
    echo $prtline
done < "$input" > ./$edgeDeployJson

# ############################## Deploy Edge Modules #####################################

echo Deploying conatiners to Azure Stack Edge
echo This will take more than 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device

output=$(az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson)

echo "installation complete"

echo solution scheduled to deploy on the $edgeDeviceId device, from the $iotHubName hub
