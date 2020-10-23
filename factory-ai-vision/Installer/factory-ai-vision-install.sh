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

now=`date +"%Y_%m_%d_%H_%M_%S"`

if [ -d "factoryai_configs" ]; then
    while true; do
        read -p "Do you want to use the existing config files? (y or n): " -n 1 -r; echo
        case $REPLY in
            [Yy]* ) isCfg=true; break;;
            [Nn]* ) isCfg=false; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done
fi

if [ "$isCfg" = true ]; then
  PS3='Choose the number corisponding to the Azure Stack Edge device: '
  configs=`ls factoryai_configs`
  select opt in $configs
  do
      echo "you chose: " $opt
      if [ "$opt" != "" ]; then
          break
      fi
  done
  
  source factoryai_configs/$opt
  echo Read from config ...
  echo '################################################'
  cat factoryai_configs/$opt
  echo '################################################'
fi


# azSubscriptonName = The friendly name of the Azure subscription
# iotHubName = The IoT Hub that corisponds to the ASE device
# edgeDeviceId = The device id of the ASE device
# cvTrainingApiKey = The Custom Vision service training key
# cvTrainingEndpoint = The Custom Vision service end point
# cpuGpu = CPU or GPU deployment

# SETLOCAL ENABLEDELAYEDEXPANSION

# ############################## Install Prereqs ##############################

echo Checking the az command
az version --output none

if [ ! $? -eq 0 ]; then
  # Azure CLI is not installed.  It has an MSI installer on Windows, or is available over REST.
  echo
  echo It looks like Azure CLI is not installed.  Please install it from:
  echo https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest
  echo and try again
  read -p "Press any key to exit..."
  exit 1
fi

echo Installing / updating the IoT extension
az extension add --name azure-iot
az extension update --name azure-iot

echo Deleting conflict Extension
(az version | grep azure-cli-iot-ext) && az extension remove --name azure-cli-iot-ext

################################ Get Tenant ###################################
# remove the header and ---- from output list - start good var data at var1
#COLUMNS=1
#outputarrten=()
#echo Logging on to Azure...
#output=$(az login -o table --query [].name --only-show-errors)
#let cnt=0
#while IFS=' ' read -r line
#do
# if [ $cnt -gt 1 ]; then
#    outputarrten+=("$line")
# fi
# let cnt++
#done <<< "$output"
#
## get length of an array
#tLen=${#outputarrten[@]}
#
#PS3='Choose the number corisponding to your tenant: '
#select opt in "${outputarrten[@]}"
#do
#  # remove carriage return
#  azSubscriptonName=${opt%$CR}
#  echo you chose: $azSubscriptonName
#  break
#done
#az account set --subscription "$azSubscriptonName" --only-show-errors

if [ "$isCfg" != true ]; then

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


    # ############################## Get Streaming Type #####################################
    while true; do
      read -p "Do you want to use Azure Live Video Analytics? (y or n): " -n 1 -r; echo
      case $REPLY in
          [Yy]* ) streaming="lva"; break;;
          [Nn]* ) streaming="opencv"; break;;
          * ) echo "Please answer yes or no.";;
      esac
    done

    # ############################## Get Azure Media SErvice #####################################

    if [ $streaming == "lva" ]; then
        echo listing Azure Media Services
        outputams=$(az ams account list --only-show-errors -o table --query [].name)
        outputarrams=()
        let cnt=0
        while read -r line
        do
         if [ $cnt -gt 1 ]; then
            outputarrams+=("$line")
         fi
         let cnt++
        done <<< "$outputams"

        # get length of an array
        tLen=${#outputarrams[@]}

        if [ $tLen -le 0 ]; then
          echo Azure Media Services not found
          echo Sorry, this demo requires that you have an existing Azure Media Services
          echo Please following this documentation to create it first 
          echo https://docs.microsoft.com/en-us/azure/media-services/latest/create-account-howto?tabs=portal
          read -p "Press <Enter> key to exit..."; echo
          exit 1
        fi
        # Only one option so no need to prompt for choice
        if [ $tLen -le 1 ]; then
          while true; do
            read -p "please confirm install to ${outputarrams[0]%$CR} ams (y or n): " -n 1 -r;echo
            case $REPLY in
                [Yy]* ) break;;
                [Nn]* ) exit;;
                * ) echo "Please answer yes or no.";;
            esac
          done
          amsServiceName=${outputarrams[0]%$CR}
        else
          PS3='Choose the number corresponding to your Azure Medis Service '
          select opt in "${outputarrams[@]}"
          do
            echo "you chose: " $opt
            amsServiceName=${opt%$CR}
            break
          done
        fi

        amsResourceGroup=$(az ams account list --only-show-errors -o tsv --query '[].[name,resourceGroup]' | grep $amsServiceName | awk '{print $2}')

        amsServicePrincipalName=factoryai_$now
        outputams=$(az ams account sp create  --name $amsServicePrincipalName --account-name $amsServiceName --resource-group $amsResourceGroup  --query '[SubscriptionId, AadTenantId, AadClientId, AadSecret]' -o tsv)
        outputamsarr=()
        while read -r line
        do
            outputamsarr+=("$line")
        done <<< "$outputams"

        amsSubscriptionId=${outputamsarr[0]}
        amsTenantId=${outputamsarr[1]}
        amsServicePrincipalAppId=${outputamsarr[2]}
        amsServicePrincipalSecret=${outputamsarr[3]}

        isAmsServicePrincipalCreated=True
        if [[ $amsServicePrincipalSecret == Cannot* ]]; then
            isAmsServicePrincipalCreated=False
            echo "AMS Service Principal '$amsServicePrincipalName' exists"
            echo "Please enter your Principal Secret for 'factoryai'"
            read amsServicePrincipalSecret
        fi

        if [[ $isAmsServicePrincipalCreated == True ]]; then
            echo "New Azure Media Service Priniple '$amsServicePrincipalName' is created"
            echo "***************************************************************************"
            echo "*** Please copy your SERVICE_PRINCIPAL_SECRET, it cannot be shown again ***"
            echo "***************************************************************************"
            echo "============================================================"
            echo "SUBSCRIPTION_ID          :" $amsSubscriptionId
            echo "RESOURCE_GROUP           :" $amsResourceGroup
            echo "TENANT_ID                :" $amsTenantId
            echo "SERVICE_NAME             :" $amsServiceName
            echo "SERVICE_PRINCIPAL_NAME   :" $amsServicePrincipalName
            echo "SERVICE_PRINCIPAL_APP_ID :" $amsServicePrincipalAppId
            echo "SERVICE_PRINCIPAL_SECRET :" $amsServicePrincipalSecret
            echo "============================================================"
            read -p "Press any key to continue..."
        fi

        echo Azure Media Service Parameters:
        echo "============================================================"
        echo "SUBSCRIPTION_ID          :" $amsSubscriptionId
        echo "RESOURCE_GROUP           :" $amsResourceGroup
        echo "TENANT_ID                :" $amsTenantId
        echo "SERVICE_NAME             :" $amsServiceName
        echo "SERVICE_PRINCIPAL_NAME   :" $amsServicePrincipalName
        echo "SERVICE_PRINCIPAL_APP_ID :" $amsServicePrincipalAppId
        echo "SERVICE_PRINCIPAL_SECRET :" $amsServicePrincipalSecret
        echo "============================================================"
    fi # if [ $streaming == "lva" ]; then

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

    iotHubConnectionString=$(az iot hub connection-string show --hub-name $iotHubName -o tsv)
    echo "Got IoTHub Connection: " $iotHubConnectionString


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

fi #if [ $isCfg != true ]; then

################################ Check for Platform ###########################################
#echo 1 amd64
#echo 2 arm64v8
#read -p "Choose the platform you're going to deploy: "
#if [ "$REPLY" == "2" ]; then
#    edgeDeploymentJson=deployment.arm64v8.json
#else
#    edgeDeploymentJson=deployment.amd64.json
#fi
if [ "$streaming" == "lva" ]; then
    edgeDeploymentJson=deployment.amd64.json
else
    edgeDeploymentJson=deployment.opencv.amd64.json
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
    prtline=${prtline//'$IOTHUB_CONNECTION_STRING'/$iotHubConnectionString}
    prtline=${prtline//'$SUBSCRIPTION_ID'/$amsSubscriptionId}
    prtline=${prtline//'$RESOURCE_GROUP'/$amsResourceGroup}
    prtline=${prtline//'$TENANT_ID'/$amsTenantId}
    prtline=${prtline//'$SERVICE_NAME'/$amsServiceName}
    prtline=${prtline//'$SERVICE_PRINCIPAL_APP_ID'/$amsServicePrincipalAppId}
    prtline=${prtline//'$SERVICE_PRINCIPAL_SECRET'/$amsServicePrincipalSecret}
    echo $prtline
done < "$input" > ./$edgeDeployJson

if [ "$isCfg" != true ]; then
    mkdir -p factoryai_configs
    factoryaiConfigName=factoryai_configs/factoryai_"$edgeDeviceId"_"$cpuGpu"_"$streaming"_"$now".cfg
    echo cvTrainingEndpoint='"'$cvTrainingEndpoint'"' >> $factoryaiConfigName
    echo cvTrainingApiKey='"'$cvTrainingApiKey'"' >> $factoryaiConfigName
    echo cpuGpu='"'$cpuGpu'"' >> $factoryaiConfigName
    echo runtime='"'$runtime'"' >> $factoryaiConfigName
    echo streaming='"'$streaming'"' >> $factoryaiConfigName
    echo iotHubName='"'$iotHubName'"' >> $factoryaiConfigName
    echo iotHubConnectionString='"'$iotHubConnectionString'"' >> $factoryaiConfigName
    echo amsSubscriptionId='"'$amsSubscriptionId'"' >> $factoryaiConfigName
    echo amsServiceName='"'$amsServiceName'"' >> $factoryaiConfigName
    echo amsResourceGroup='"'$amsResourceGroup'"' >> $factoryaiConfigName
    echo amsTanantId='"'$amsTenantId'"' >> $factoryaiConfigName
    echo amsServicePrincipalName='"'$amsServicePrincipalName'"' >> $factoryaiConfigName
    echo amsServicePrincipalSecret='"'$amsServicePrincipalSecret'"' >> $factoryaiConfigName
    echo edgeDeviceId='"'$edgeDeviceId'"' >> $factoryaiConfigName
fi


# ############################## Deploy Edge Modules #####################################

echo Deploying conatiners to Azure Stack Edge
echo This will take more than 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device

#echo az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson
output=$(az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson)

echo "installation complete"

echo solution scheduled to deploy on the $edgeDeviceId device, from the $iotHubName hub
