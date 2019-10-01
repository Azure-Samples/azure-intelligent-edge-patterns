#! /bin/bash
echo $(pwd)
FUNC_PUBLISH_URL=$(echo $1 | sed 's@[[:space:]]*$@@g')
ZIP_DEPLOY_URL="/api/zipdeploy"
COMPLETE_URL=$FUNC_PUBLISH_URL$ZIP_DEPLOY_URL
curl -X POST --data-binary @function.zip ${COMPLETE_URL}
