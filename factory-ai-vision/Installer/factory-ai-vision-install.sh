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

if [ -d "factoryai_configs/factoryai_cfgs" ]; then
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
  PS3='Choose the number corresponding to the Azure Stack Edge device: '
  configs=`ls factoryai_configs/factoryai_cfgs`
  select opt in $configs
  do
      echo "you chose: " $opt
      if [ "$opt" != "" ]; then
          break
      fi
  done
  
  source factoryai_configs/factoryai_cfgs/$opt
  echo Read from config ...
  echo '################################################'
  cat factoryai_configs/factoryai_cfgs/$opt
  # FOR Backwar Compatibility
  if [ "$platform" = "" ]; then
    platform="amd64"
  fi
  echo '################################################'
fi


# azSubscriptonName = The friendly name of the Azure subscription
# iotHubName = The IoT Hub that corresponds to the ASE device
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
#PS3='Choose the number corresponding to your tenant: '
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
      read -p "Do you want to use Azure Video Analytics? (y or n): " -n 1 -r; echo
      case $REPLY in
          [Yy]* ) streaming="ava"; break;;
          [Nn]* ) streaming="opencv"; break;;
          * ) echo "Please answer yes or no.";;
      esac
    done


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
      PS3='Choose the number corresponding to the IoTHub managing your target edge device: '
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
      PS3='Choose the number corresponding to the Azure Stack Edge device: '
      select opt in "${outputarrdevs[@]}"
      do
        echo "you chose: " $opt
        edgeDeviceId=${opt%$CR}
        break
      done
    fi

    ################################ Check for Platform ###########################################
    echo 1 amd64
    echo 2 arm64v8
    read -p "Choose the platform you're going to deploy: "
    if [ "$REPLY" == "1" ]; then
	platform="amd64"
    elif [ "$REPLY" == "2" ]; then
	platform="arm64v8"
    else
	echo "Unknown Platform"
	exit
    fi



    ################################ Check for Device ###########################################
    if [ "$platform" == "amd64" ]; then
	    PS3='Choose the number corresponding to the Azure Stack Edge device: '
	    deviceOptions="cpu gpu vpu"
	    select cpuGpu in $deviceOptions
	    do
	      echo "you chose: " $cpuGpu
	      if [ "$cpuGpu" != "" ]; then
		  break
	      fi
	    done
	    if [ "$cpuGpu" == "cpu" ]; then
		runtime="runc"
	    fi
	    if [ "$cpuGpu" == "gpu" ]; then
		runtime="nvidia"
	    fi
	    if [ "$cpuGpu" == "vpu" ]; then
		runtime="runc"
	    fi
    elif [ "$platform" == "arm64v8" ]; then
	    PS3='Choose the number corresponding to the Azure Stack Edge device: '
	    deviceOptions="cpu jetson"
	    select cpuGpu in $deviceOptions
	    do
	      echo "you chose: " $cpuGpu
	      if [ "$cpuGpu" != "" ]; then
		  break
	      fi
	    done
	    if [ "$cpuGpu" == "cpu" ]; then
		runtime="runc"
	    fi
	    if [ "$cpuGpu" == "jetson" ]; then
		runtime="nvidia"
	    fi
    fi

fi #if [ $isCfg != true ]; then

################################ Check for Platform ###########################################

if [ "$streaming" == "ava" ]; then
    edgeDeploymentJson=deployment.ava.json
else
    edgeDeploymentJson=deployment.opencv.json
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
    prtline=${prtline//'<platform>'/$platform}
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
    mkdir -p factoryai_configs/factoryai_cfgs
    factoryaiConfigName=factoryai_configs/factoryai_cfgs/factoryai_"$edgeDeviceId"_"$cpuGpu"_"$streaming"_"$now".cfg
    echo cvTrainingEndpoint='"'$cvTrainingEndpoint'"' > $factoryaiConfigName
    echo cvTrainingApiKey='"'$cvTrainingApiKey'"' >> $factoryaiConfigName
    echo cpuGpu='"'$cpuGpu'"' >> $factoryaiConfigName
    echo runtime='"'$runtime'"' >> $factoryaiConfigName
    echo platform='"'$platform'"' >> $factoryaiConfigName
    echo streaming='"'$streaming'"' >> $factoryaiConfigName
    echo iotHubName='"'$iotHubName'"' >> $factoryaiConfigName
    echo iotHubConnectionString='"'$iotHubConnectionString'"' >> $factoryaiConfigName
    echo amsSubscriptionId='"'$amsSubscriptionId'"' >> $factoryaiConfigName
    echo amsServiceName='"'$amsServiceName'"' >> $factoryaiConfigName
    echo amsResourceGroup='"'$amsResourceGroup'"' >> $factoryaiConfigName
    echo amsTenantId='"'$amsTenantId'"' >> $factoryaiConfigName
    echo amsServicePrincipalName='"'$amsServicePrincipalName'"' >> $factoryaiConfigName
    echo amsServicePrincipalSecret='"'$amsServicePrincipalSecret'"' >> $factoryaiConfigName
    echo amsServicePrincipalAppId='"'$amsServicePrincipalAppId'"' >> $factoryaiConfigName
    echo edgeDeviceId='"'$edgeDeviceId'"' >> $factoryaiConfigName

    mkdir -p factoryai_configs/ams_cfgs
    factoryaiAmsConfigName=factoryai_configs/ams_cfgs/"$amsServiceName".cfg
    echo amsSubscriptionId='"'$amsSubscriptionId'"' > $factoryaiAmsConfigName
    echo amsServiceName='"'$amsServiceName'"' >> $factoryaiAmsConfigName
    echo amsResourceGroup='"'$amsResourceGroup'"' >> $factoryaiAmsConfigName
    echo amsTenantId='"'$amsTenantId'"' >> $factoryaiAmsConfigName
    echo amsServicePrincipalName='"'$amsServicePrincipalName'"' >> $factoryaiAmsConfigName
    echo amsServicePrincipalAppId='"'$amsServicePrincipalAppId'"' >> $factoryaiAmsConfigName
    echo amsServicePrincipalSecret='"'$amsServicePrincipalSecret'"' >> $factoryaiAmsConfigName
fi


# ############################## Deploy Edge Modules #####################################

echo Deploying containers to Azure Stack Edge
echo This will take more than 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device

#echo az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson
output=$(az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson)

echo "installation complete"

echo solution scheduled to deploy on the $edgeDeviceId device, from the $iotHubName hub
