#!/bin/bash

echo "Removing Kubeflow from ${KF_DIR}, according to ${KF_CONFIG_FILENAME}"

# Go to your Kubeflow deployment directory
cd ${KF_DIR}
if test $? -ne 0
then
	echo "ERROR: Failed to change dir to ${KF_DIR}!"
    exit 2
fi

# Remove Kubeflow
kfctl delete -f ${KF_CONFIG_FILENAME}
