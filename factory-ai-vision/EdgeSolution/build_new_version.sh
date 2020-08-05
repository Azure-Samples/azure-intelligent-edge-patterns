#!/bin/zsh
if [ ${#@} -ne 0 ] && [ "${@#"--silent"}" = "" ]; then
	echo 'HERE'
	stty -echo;
fi;

# Step
STEP=0
function next_step() {
	STEP=$((STEP+1))
echo
echo "Step ${STEP}."
}

# Color
color_end="\033[0m"
color_gray="\033[37m"
color_green="\033[0;32m"
color_red="\033[0;31m"
color_yellow="\033[0;33m"

color_info=${color_green}
color_warning=${yellow}
color_error=${color_red}

# Start ===================================================
next_step

# =========================================================
# Where is this script...
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "This script is located at:"
echo "	${DIR}"
next_step

# =========================================================
# checking environment file '.env'"
if [ -f ${DIR}/.env ]; then
	echo "Environment file found"
	echo "	${DIR}/.env"
	echo "	Loading environment..."
	. ${DIR}/.env

else
	echo "env file not found."
	echo "	${DIR}/.env"
	echo "	exit 1..."
	exit 1
fi
next_step

# =========================================================
# Check container registry name
if [ -z ${CONTAINER_REGISTRY_NAME} ]; then
	echo "CONTAINER_REGISTRY_NAME not found in .env"
	echo "	${DIR}/.env"
	echo "exit 1..."
	exit 1
else
	echo "CONTAINER_REGISTRY_NAME found"
	echo "	${CONTAINER_REGISTRY_NAME}"
fi
next_step

# =========================================================
# What is this script's name?
THIS_SCRIPT_NAME="$(basename $0)"
echo "This script's name is:"
echo "	${THIS_SCRIPT_NAME}"
next_step

# =========================================================
# Get module file
INFERENCE_MODULE_FILE="${DIR}"/modules/InferenceModule/module.json

if [ ! -f ${INFERENCE_MODULE_FILE} ]; then
	echo "${color_error}"
	echo "INFERENCE_MODULE_FILE not found..."
	echo "	${INFERENCE_MODULE_FILE}"
	echo "exit 1..."
	exit 1
else	
	echo "${color_info}"
	echo "INFERENCE_MODULE_FILE found"
	echo "	${INFERENCE_MODULE_FILE}"
fi
echo "${color_end}"
next_step

# =========================================================
WEB_MODULE_FILE="${DIR}"/modules/WebModule/module.json
if [ ! -f ${WEB_MODULE_FILE} ]; then
	echo "${color_error}"
	echo "WEB_MODULE_FILE not found..."
	echo "	${WEB_MODULE_FILE}"
	echo "exit 1..."
	exit 1
else
	echo "${color_info}"
	echo "WEB_MODULE_FILE found"
	echo "	${WEB_MODULE_FILE}"
fi
echo ${color_end}
next_step

# =========================================================
# Check inferencemodule change
echo "Checking inferencemodule change"
INFERENCE_MODULE_VERSION=$(cat "${INFERENCE_MODULE_FILE}" | jq '.image.tag.version' |  sed -e 's/^"//' -e 's/"$//')
echo "	Inference Module changed"
echo "	Updating version"
INFERENCE_MODULE_NEW_VERSION=$(echo "${INFERENCE_MODULE_VERSION}" | perl -pe 's/^((\d+\.)*)(\d+)(.*)$/$1.($3+1).$4/e' )
echo "	Inference Module version: ${INFERENCE_MODULE_VERSION} => ${INFERENCE_MODULE_NEW_VERSION}"
cat "${INFERENCE_MODULE_FILE}" | jq ".image.tag.version= \"${INFERENCE_MODULE_NEW_VERSION}\"" > ${INFERENCE_MODULE_FILE}.tmp
mv ${INFERENCE_MODULE_FILE}.tmp ${INFERENCE_MODULE_FILE}
git add ${INFERENCE_MODULE_FILE} 
next_step

# Check webmodule change
echo "Checking webmodule change"
WEB_MODULE_VERSION=$(cat "${WEB_MODULE_FILE}" | jq '.image.tag.version' |sed -e 's/^"//' -e 's/"$//')
echo "	Web Module change"
WEB_MODULE_NEW_VERSION=$(echo "${WEB_MODULE_VERSION}" | perl -pe 's/^((\d+\.)*)(\d+)(.*)$/$1.($3+1).$4/e' )
echo "	Web Module version: ${WEB_MODULE_VERSION} => ${WEB_MODULE_NEW_VERSION}"
cat "${WEB_MODULE_FILE}" | jq ".image.tag.version= \"${WEB_MODULE_NEW_VERSION}\"" > ${WEB_MODULE_FILE}.tmp
mv ${WEB_MODULE_FILE}.tmp ${WEB_MODULE_FILE}
git add ${WEB_MODULE_FILE} 
next_step

echo "Checking if Inference Module need to build new container image..."
echo "	Yes..."
echo "	${INFERENCE_MODULE_NEW_VERSION}"
echo '	Building new container images'
echo "	Build & push Inference Module version: ${INFERENCE_MODULE_NEW_VERSION}"
docker build  --rm -f "${DIR}/modules/InferenceModule/Dockerfile.cpuamd64" -t ${CONTAINER_REGISTRY_NAME}/intelligentedge/inferencemodule:${INFERENCE_MODULE_NEW_VERSION}-cpuamd64 "${DIR}/modules/InferenceModule"
docker push ${CONTAINER_REGISTRY_NAME}/intelligentedge/inferencemodule:${INFERENCE_MODULE_NEW_VERSION}-cpuamd64
next_step

echo "Checking if Web Module need to build new container image..."
echo "	Yes..."
echo '	Building new container images'
echo "	Build & push Web Module version: ${WEB_MODULE_NEW_VERSION}"
docker build  --rm -f "${DIR}/modules/WebModule/Dockerfile.amd64" -t ${CONTAINER_REGISTRY_NAME}/intelligentedge/visionwebmodule:${WEB_MODULE_NEW_VERSION}-amd64 "${DIR}/modules/WebModule"
docker push ${CONTAINER_REGISTRY_NAME}/intelligentedge/visionwebmodule:${WEB_MODULE_NEW_VERSION}-amd64
next_step

echo 'Updating deployment file'
DEPLOY_FILE="${DIR}/config/deployment.cpu.amd64.json"

if [ -f "${DEPLOY_FILE}" ]; then
	echo '	DEPLOY_FILE found:'
	echo "		${DEPLOY_FILE}"
	echo "	Updating to latest version..."
	if [ ! -z ${INFERENCE_MODULE_NEW_VERSION} ]; then
		cat ${DEPLOY_FILE} | jq ".modulesContent.\"\$edgeAgent\".\"properties.desired\".modules.InferenceModule.settings.image = \"${CONTAINER_REGISTRY_NAME}/intelligentedge/inferencemodule:${INFERENCE_MODULE_NEW_VERSION}-cpuamd64\"" > ${DEPLOY_FILE}.tmp
		mv ${DEPLOY_FILE}.tmp ${DEPLOY_FILE}
	fi
	if [ ! -z ${WEB_MODULE_NEW_VERSION} ]; then
		cat ${DEPLOY_FILE} | jq ".modulesContent.\"\$edgeAgent\".\"properties.desired\".modules.WebModule.settings.image = \"${CONTAINER_REGISTRY_NAME}/intelligentedge/visionwebmodule:${WEB_MODULE_NEW_VERSION}-amd64\"" > ${DEPLOY_FILE}.tmp
		mv ${DEPLOY_FILE}.tmp ${DEPLOY_FILE}
	fi
else
	echo '	DEPLOY_FILE not found'
	echo '	You have to update the version of deploy yourself...'
	echo '	Skipping'
fi
next_step

echo 'All done. Commit new version to git'
echo
git commit -m "new version by ${THIS_SCRIPT_NAME}"
