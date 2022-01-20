#!/bin/bash
#
# This script automates the Kubeflow uninstallation.
# Update the settings according to your specific needs(KF_DIR, and KF_CONFIG_FILENAME
# are defined in the install script and saved in .bashrc). 
# It should be executed at the master node of your Kubernetes cluster
#

source ~/.bashrc

echo "Removing Kubeflow from ${KF_DIR}, according to ${KF_CONFIG_FILENAME}"

# Go to your Kubeflow deployment directory
cd ${KF_DIR}
if test $? -ne 0
then
	echo "ERROR: Failed to change dir to ${KF_DIR}!"
    echo "You might need to run '. ~/.bashrc' - the KF_CONFIG_FILENAME(which you need to do uninstallation) is defined there"
    exit 2
fi

# Remove Kubeflow
kfctl delete -f ${KF_CONFIG_FILENAME}
if test $? -ne 0
then
	echo "ERROR: Failed to change dir to ${KF_DIR}!"
    echo "You might need to run '. ~/.bashrc' - the PATH to kfctl(which you need to do uninstallation) is defined there"
    exit 2
fi

echo ""
echo ""
echo "IMPORTANT:"
echo "  After Kubeflow deleted from Kubernetes you will also need to remove"
echo "  folder ${KF_DIR} to clean everything. The command is:"
echo "  $ sudo rm -rf ${KF_DIR}"
echo ""
echo "  Until Kubeflow is deleted, you can see if all pods have been terminated: "
echo ""
echo "  $ ./check_status.sh"
echo ""
