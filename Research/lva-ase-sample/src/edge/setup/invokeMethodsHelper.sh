# #Julia Lieberman bash script to simplify LVA process.
# # this will take a deployment manifest, deploy it, then run all the functions 
# # the Program.cs / operations.json files specify
# # and monitor the iot hub! Woohoo!

HUBNAME=${1:-}
DEVICE_ID=${2:-}
IOTHUB_CONNECTION_STRING=${3:-}

# add quotes
IOTHUB_CONNECTION_STRING="\"${IOTHUB_CONNECTION_STRING}\""
SAS_TOKEN=$(az iot hub generate-sas-token -n ${HUBNAME} | jq .sas)

HEADER=$(echo -e "Authorization: ${SAS_TOKEN}" | tr -d '"')
auth="'"$HEADER"'"
MODULE_URL="https://${HUBNAME}.azure-devices.net/twins/${DEVICE_ID}/modules/lvaEdge/methods?api-version=2018-06-30"
FILE="jsonfiles/instanceset.json"

# if `/bin/grep -q "FILENAME" $FILE`; then #if hasn't been replaced yet
#     # update json file to contain correct file name
#     echo -e "What is the name of the rtsp video file? This should be in your input video folder on device share.
#     If you downloaded it as advised, it should be named mhtestdrive.mkv: "
#     read -p ">> " FILENAME
#     sed -i "s/\$FILENAME/$FILENAME/" $FILE
# else
#     echo "no replacements"
# fi

function sendQuery()
{
    echo ${2}
    curl -X POST \
        "${1}" \
        -H "Authorization: ${SAS_TOKEN}" \
        -H 'Content-Type: application/json' \
        -d "@jsonfiles/${2}.json" \
    | json_pp
}

function waitToHitEnter()
{
    arg1=${1:-}
    echo "${arg1}"
    while [ true ]; do
    read -n 1 -r -p "Press enter to continue" key

    if [ "$key" = "" ]; then
        echo "space pressed"
        break;
    else
        echo "waiting"
    fi
    done
}

# arrays to reduce redundancy
declare -a starters activators cleanup
starters=("topologylist" "instancelist" "topologyset" "instanceset")
activators=("instanceactivate" "instancelist")
cleanup=("instancedeactivate" "instancedelete" "instancelist" "topologydelete" "topologylist")

waitToHitEnter "Hit enter to list your current graph instances"
for i in "${starters[@]}"
do
    sendQuery $MODULE_URL $i
done

echo -e "
In order to monitor and view the output, please open another Azure cloud shell by going to https://shell.azure.com and type in the following command into the terminal:
az iot hub monitor-events -n ${HUBNAME} --login ${IOTHUB_CONNECTION_STRING}
Once you have that window open, continue this script and you can view output! Close that window whenever you would like, but we recommend you keep it open for a few minutes
so you can see the real-time inferences!"

waitToHitEnter "Hit enter to continue to activate your graph instance"
for i in "${activators[@]}"
do
    sendQuery $MODULE_URL $i
done

waitToHitEnter "Hit enter to continue to deactivate and delete your graph instance"
for i in "${cleanup[@]}"
do
    sendQuery $MODULE_URL $i
done