#!/bin/bash
#
# This script automates the Kubeflow installation described in this chapter.
# Update the settings according to your specific needs. 
# It should be executed at the master node of your Kubernetes cluster
#

export KF_CTL_DIR=~/kubeflow/
export KF_INSTALL_LOG=$KF_CTL_DIR/install.log
export PATH=$PATH:$KF_CTL_DIR
export KF_NAME=sandboxASkf
export KF_USERNAME=azureuser
export KFCTL_RELEASE_FILENAME=kfctl_v1.0.2-0-ga476281_linux.tar.gz
export KFCTL_RELEASE_URI="https://github.com/kubeflow/kfctl/releases/download/v1.0.2/${KFCTL_RELEASE_FILENAME}"
export BASE_DIR=/opt
export KF_DIR=${BASE_DIR}/${KF_NAME}
export KF_CONFIG_FILENAME="kfctl_k8s_istio.v1.0.2.yaml"
export KF_CONFIG_URI="https://raw.githubusercontent.com/kubeflow/manifests/v1.0-branch/kfdef/${KF_CONFIG_FILENAME}"


echo "Installing Kubeflow" | tee $KF_INSTALL_LOG
echo "---------" | tee $KF_INSTALL_LOG
echo "KF_CTL_DIR: $KF_CTL_DIR" | tee $KF_INSTALL_LOG
echo "KF_NAME: $KF_NAME" | tee $KF_INSTALL_LOG
echo "KF_USERNAME: $KF_USERNAME" | tee $KF_INSTALL_LOG
echo "KFCTL_RELEASE_URI: $KFCTL_RELEASE_URI" | tee $KF_INSTALL_LOG
echo "KF_DIR: $KF_DIR" | tee $KF_INSTALL_LOG
echo "KF_CONFIG_URI=: $KF_CONFIG_URI" | tee $KF_INSTALL_LOG
echo "---------" | tee $KF_INSTALL_LOG


echo "#--- Kubeflow config" >> ~/.bashrc
echo "export PATH=\$PATH:${KF_CTL_DIR}" >> ~/.bashrc
echo "export KF_DIR=${KF_DIR}" >> ~/.bashrc
echo "export KF_CONFIG_FILENAME=${KF_CONFIG_FILENAME}" >> ~/.bashrc
echo "#--- Kubeflow config end" >> ~/.bashrc

echo "Creating the dir for kfctl, $KF_CTL_DIR"
mkdir -p $KF_CTL_DIR || exit 2
cd $KF_CTL_DIR  || exit 2
wget $KFCTL_RELEASE_URI 
if test $? -eq 0
then
	echo "Downloaded ${KFCTL_RELEASE_URI}." | tee $KF_INSTALL_LOG
else
	echo "ERROR: Failed to download ${KFCTL_RELEASE_URI}!" | tee $KF_INSTALL_LOG
    exit 2
fi

tar -xvf ${KFCTL_RELEASE_FILENAME}
if test $? -eq 0
then
	echo "Unpacked ${KFCTL_RELEASE_FILENAME}."  | tee $KF_INSTALL_LOG
else
	echo "ERROR: Failed to unpack ${KFCTL_RELEASE_FILENAME}!"  | tee $KF_INSTALL_LOG
    exit 2
fi
    
sudo mkdir -p ${KF_DIR}
if test $? -eq 0
then
	echo "Created ${KF_DIR}."  | tee $KF_INSTALL_LOG
else
	echo "ERROR: Failed to create ${KF_DIR}!"  | tee $KF_INSTALL_LOG
    exit 2
fi

sudo chown ${KF_USERNAME} ${KF_DIR}  || exit 2
cd ${KF_DIR}  || exit 2
kfctl apply -V -f ${KF_CONFIG_URI}  || exit 2

echo "The installation will take a while, and there will be some time needed to create the pods."
echo "In a few minutes, check the resources deployed correctly in namespace 'kubeflow'"
echo "kubectl get all -n kubeflow"

