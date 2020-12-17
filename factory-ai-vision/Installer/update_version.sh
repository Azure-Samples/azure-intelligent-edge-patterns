VERSION=$(cat deployment.lva.json | grep -o 'nginxmodule:*.*.*-' | sed -E 's/.*([0-9].[0-9].[0-9]).*/\1/')

echo Current Version: $VERSION

echo Update to?
#read

REPLY=0.8.0
NEW_VERSION=${REPLY}


echo $VERSION to $NEW_VERSION

sed -i '' "s/${VERSION}/${NEW_VERSION}/" deployment.lva.json
sed -i '' "s/${VERSION}/${NEW_VERSION}/" deployment.opencv.json
