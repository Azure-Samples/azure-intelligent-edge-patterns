# Bash script to simplify LVA process. Last Updated August 2020
# this will invoke direct methods on the lvaEdge module
# this script enables running the sample entirely in the Azure Cloud Shell

YELLOW='\033[1;33m'
NC='\033[0m' # No Color
ENV_FILE='edge-deployment/.env'

source ${ENV_FILE}

SAS_TOKEN=$(az iot hub generate-sas-token -n ${IOTHUB} | jq .sas)
MODULE_URL="https://${IOTHUB}.azure-devices.net/twins/${DEVICE_ID}/modules/lvaEdge/methods?api-version=2018-06-30"
FILE="jsonfiles/instanceset.json"

# invoke direct method on edge module
# @param 1 - the module URL (constructed above)
# @param 2 - the filename containing the json with the method instructions
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

# wait to hit enter, print the next function to be run
# @param 1 - optional message to print to console
function waitToHitEnter()
{
    arg1=${1:-}
    echo -e "
    ${YELLOW}${arg1}${NC}
    "
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

# run all the desired methods
waitToHitEnter "Hit enter to list your current graph instances"
for i in "${starters[@]}"
do
    sendQuery $MODULE_URL $i
done

echo -e "
In order to monitor and view the output, please open another Azure cloud shell by going to https://shell.azure.com and type in the following command into the terminal:
${YELLOW}az iot hub monitor-events -n ${IOTHUB} --login \"${IOTHUB_CONNECTION_STRING}\"${NC}
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