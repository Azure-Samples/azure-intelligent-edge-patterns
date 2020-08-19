#!/bin/bash

# =========================================================
# ===	Setting up					===
# =========================================================
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

# =========================================================
# ===	Real script					===
# =========================================================
echo "Build.BuildNumber		: $(Build.BuildNumber)"
echo "Build.SourceBranchName	: $(Build.SourceBranchName)"
PIPELINE_MODULE_POSTFIX="$(Build.SourceBranchName)-$(Build.BuildNumber)"
echo "Pipeline module postfix 	: ${PIPELINE_MODULE_POSTFIX}"
next_step

# =========================================================
# ===	Install jq					===
# =========================================================
sudo apt-get install -y jq
next_step


# =========================================================
# === Get path of this script				===
# =========================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "This script is located at:"
echo "	${DIR}"
next_step


# =========================================================
# === Checking environment file '.env'"			===
# =========================================================
echo "Let Azure pipelines to handle enviroment variables"
next_step


# =========================================================
# === get name of this script				===
# =========================================================
THIS_SCRIPT_NAME="$(basename $0)"
echo "This script's name is:"
echo "	${THIS_SCRIPT_NAME}"
next_step


# =========================================================
# === Get Inference module file				===
# =========================================================
INFERENCE_MODULE_FILE="${DIR}"/modules/InferenceModule/module.json

if [ ! -f ${INFERENCE_MODULE_FILE} ]; then
	echo "INFERENCE_MODULE_FILE not found..."
	echo "	${INFERENCE_MODULE_FILE}"
	echo "exit 1..."
	exit 1
else	
	echo "INFERENCE_MODULE_FILE found"
	echo "	${INFERENCE_MODULE_FILE}"
fi
next_step


# =========================================================
# === Get Web module file				===
# =========================================================
WEB_MODULE_FILE="${DIR}"/modules/WebModule/module.json
if [ ! -f ${WEB_MODULE_FILE} ]; then
	echo "WEB_MODULE_FILE not found..."
	echo "	${WEB_MODULE_FILE}"
	echo "exit 1..."
	exit 1
else
	echo "WEB_MODULE_FILE found"
	echo "	${WEB_MODULE_FILE}"
fi
next_step


# =========================================================
# === Add inference module version			===
# =========================================================
echo "Checking inferencemodule change"
INFERENCE_MODULE_VERSION=$(cat "${INFERENCE_MODULE_FILE}" | jq '.image.tag.version' |  sed -e 's/^"//' -e 's/"$//')
echo "	Inference Module changed"
echo "	Updating version"
# Add version number
#	0.3.87 -> 0.3.88
INFERENCE_MODULE_NEW_VERSION="${INFERENCE_MODULE_VERSION}-${PIPELINE_MODULE_POSTFIX}"
echo "	Inference Module version: ${INFERENCE_MODULE_VERSION} => ${INFERENCE_MODULE_NEW_VERSION}"
cat "${INFERENCE_MODULE_FILE}" | jq ".image.tag.version= \"${INFERENCE_MODULE_NEW_VERSION}\"" > ${INFERENCE_MODULE_FILE}.tmp
mv ${INFERENCE_MODULE_FILE}.tmp ${INFERENCE_MODULE_FILE}
next_step


# =========================================================
# === Check web module version				===
# =========================================================
echo "Checking webmodule change"
WEB_MODULE_VERSION=$(cat "${WEB_MODULE_FILE}" | jq '.image.tag.version' |sed -e 's/^"//' -e 's/"$//')
echo "	Web Module change"
WEB_MODULE_NEW_VERSION="${WEB_MODULE_VERSION}-${PIPELINE_MODULE_POSTFIX}"
echo "	Web Module version: ${WEB_MODULE_VERSION} => ${WEB_MODULE_NEW_VERSION}"
cat "${WEB_MODULE_FILE}" | jq ".image.tag.version= \"${WEB_MODULE_NEW_VERSION}\"" > ${WEB_MODULE_FILE}.tmp
mv ${WEB_MODULE_FILE}.tmp ${WEB_MODULE_FILE}
next_step


# =========================================================
# === Commit and let Azure pipelines to handle the rest.===
# =========================================================
echo 'All done...'
