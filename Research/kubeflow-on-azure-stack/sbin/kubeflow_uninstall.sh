#!/bin/bash
#
# This script automates the Kubeflow uninstallation.
# Update the settings according to your specific needs(KF_DIR, and KF_CONFIG_FILENAME
# are defined in the install script and saved in .bashrc). 
# It should be executed at the master node of your Kubernetes cluster
#

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
