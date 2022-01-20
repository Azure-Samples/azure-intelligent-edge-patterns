#/bin/bash
SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
echo ${SCRIPT_PATH}
#exit
cd ${SCRIPT_PATH}

GIT_ROOT=$(git rev-parse --show-toplevel)
echo ${GIT_ROOT}

PROJECT_PATH="${GIT_ROOT}/factory-ai-vision"
SOLUTION_PATH="${PROJECT_PATH}/EdgeSolution"

cd ${SOLUTION_PATH}
find . -name "*" | grep -E "deployment.*.template.json|module.json|env-template" | zip archive -@
