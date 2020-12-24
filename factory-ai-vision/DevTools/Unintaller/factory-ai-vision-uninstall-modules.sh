#!/bin/bash
# @ECHO OFF
AZURE_CORE_NO_COLOR=
AZURE_CORE_ONLY_SHOW_ERRORS=True

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

edgeDeployJson=deployment.empty.json

# ############################## Deploy Edge Modules #####################################

echo Deploying containers to Azure Stack Edge
echo This will take more than 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device

output=$(az iot edge set-modules --device-id $edgeDeviceId --hub-name $iotHubName --content $edgeDeployJson)

echo "uninstallation complete"

