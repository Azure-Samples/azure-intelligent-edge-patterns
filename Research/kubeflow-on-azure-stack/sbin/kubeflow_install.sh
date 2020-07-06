#!/bin/bash
#
# This script automates the Kubeflow installation described in this chapter.
# Update the settings according to your specific needs. 
# It should be executed at the master node of your Kubernetes cluster
#

# default values
export KF_CTL_DIR=~/kubeflow/
export KF_NAME=sandboxASkf
export KF_USERNAME=azureuser
export KFCTL_RELEASE_FILENAME=kfctl_v1.0.2-0-ga476281_linux.tar.gz
export KFCTL_RELEASE_URI="https://github.com/kubeflow/kfctl/releases/download/v1.0.2/${KFCTL_RELEASE_FILENAME}"
export KF_DIR_BASE=/opt
export KF_CONFIG_FILENAME="kfctl_k8s_istio.v1.0.2.yaml"
export KF_CONFIG_URI="https://raw.githubusercontent.com/kubeflow/manifests/v1.0-branch/kfdef/${KF_CONFIG_FILENAME}"
export DO_UNATTENDED=0

while [[ $# > 0 ]]
do
  case "$1" in
    --kf_ctl_dir)
      KF_CTL_DIR="$2"
      echo "set kf_ctl_dir to ${KF_CTL_DIR}"
      shift
      ;;
    --kf_name)
      KF_NAME="$2"
      echo "set kf_name to ${KF_NAME}"
      shift
      ;;
    --kf_username)
      KF_USERNAME="$2"
      echo "set kf_username to ${KF_USERNAME}"
      shift
      ;;
    #--kfctl_release_uri)
    #  KFCTL_RELEASE_URI="$2"
    #  echo "set kfctl_release_uri to ${KFCTL_RELEASE_URI}"
    #  shift
    #  ;;
    --kf_dir_base)
      KF_DIR_BASE="$2"
      echo "set kf_dir_base to ${KF_DIR_BASE}"
      shift
      ;;
    --kf_config_filename)
      KF_CONFIG_FILENAME="$2"
      echo "set kf_config_filename to ${KF_CONFIG_FILENAME}"
      shift
      ;;
    #--kf_config_uri)
    #  KF_CONFIG_URI="$2"
    #  echo "set kf_config_uri to ${KF_CONFIG_URI}"
    #  shift
    #  ;;
    -y|--unattended)
      DO_UNATTENDED=1
      ;;
    -h|--help|*)
      echo "Usage: kubeflow_install.sh [options]"
      echo " "
      echo "Options:"
      echo "    --kf_ctl_dir <dir_name>      - where to download and install kfctl"
      echo "    --kf_name <name>             - name of the Kubeflow cluster"
      echo "    --kf_username <username>     - user name under which to install Kubeflow"
      #echo "    --kfctl_release_uri <uri>    - kfctl URI"
      echo "    --kf_dir_base <dir_name>     - the base dir for instances of Kubeflow"
      #echo "    --kf_config_uri <uri>        - config URI of Kubeflow config"
      echo "    -y                           - do unattended(do not pause for user input)"
      echo "    --help"
      exit 1
      ;;
  esac
  shift
done

export PATH=$PATH:$KF_CTL_DIR
export KF_DIR=${KF_DIR_BASE}/${KF_NAME}
export KF_INSTALL_LOG=$KF_CTL_DIR/install.log


mkdir -p $KF_CTL_DIR || exit 2
echo "Installing Kubeflow" | tee $KF_INSTALL_LOG
echo "Writing logs to \"$KF_INSTALL_LOG\""
echo "---------" | tee -a $KF_INSTALL_LOG
echo "KF_CTL_DIR: $KF_CTL_DIR" | tee -a $KF_INSTALL_LOG
echo "KF_NAME: $KF_NAME" | tee -a $KF_INSTALL_LOG
echo "KF_USERNAME: $KF_USERNAME" | tee -a $KF_INSTALL_LOG
echo "KFCTL_RELEASE_URI: $KFCTL_RELEASE_URI" | tee -a $KF_INSTALL_LOG
echo "KF_DIR: $KF_DIR" | tee -a $KF_INSTALL_LOG
echo "KF_CONFIG_URI=: $KF_CONFIG_URI" | tee -a $KF_INSTALL_LOG
echo "---------" | tee -a $KF_INSTALL_LOG


echo ""
echo "IMPORTANT:"
echo "   Do NOT stop the script until it finishes."
echo "   Some Kubernetes errors and warnings are expected until the system fully functional."
echo "   After the installer finishes, it takes several minutes for the containers to create."
echo "   Kubeflow cluster name, config, and path to kfctl will be apended to ~/.bashrc for the"
echo "   kubeflow_uninstall.sh to work. You will need to re-login or run \". ~/.bashrc\""

if [ $DO_UNATTENDED -ne "1" ]
then
  echo ""
  echo ""
  read -s -n 1 -p "Press any key to continue . . ."
  echo ""
  echo ""
  echo ""
fi

echo "#--- Kubeflow config" >> ~/.bashrc
echo "export PATH=\$PATH:${KF_CTL_DIR}" >> ~/.bashrc
echo "export KF_DIR=${KF_DIR}" >> ~/.bashrc
echo "export KF_CONFIG_FILENAME=${KF_CONFIG_FILENAME}" >> ~/.bashrc
echo "#--- Kubeflow config end" >> ~/.bashrc

echo "Creating the dir for kfctl, $KF_CTL_DIR" | tee -a $KF_INSTALL_LOG
cd $KF_CTL_DIR  || exit 2
wget -nc $KFCTL_RELEASE_URI 
if test $? -eq 0
then
	echo "Downloaded ${KFCTL_RELEASE_URI}." | tee -a $KF_INSTALL_LOG
else
	echo "ERROR: Failed to download ${KFCTL_RELEASE_URI}!" | tee -a $KF_INSTALL_LOG
    exit 2
fi

tar -xvf ${KFCTL_RELEASE_FILENAME}
if test $? -eq 0
then
	echo "Unpacked ${KFCTL_RELEASE_FILENAME}."  | tee -a $KF_INSTALL_LOG
else
	echo "ERROR: Failed to unpack ${KFCTL_RELEASE_FILENAME}!"  | tee -a $KF_INSTALL_LOG
    exit 2
fi
    
sudo mkdir -p ${KF_DIR}
if test $? -eq 0
then
	echo "Created ${KF_DIR}."  | tee -a $KF_INSTALL_LOG
else
	echo "ERROR: Failed to create ${KF_DIR}!"  | tee -a $KF_INSTALL_LOG
    exit 2
fi

sudo chown ${KF_USERNAME} ${KF_DIR}  || exit 2
cd ${KF_DIR}  || exit 2
kfctl apply -V -f ${KF_CONFIG_URI}   | tee -a $KF_INSTALL_LOG || exit 2

echo "PLEASE READ:" | tee -a $KF_INSTALL_LOG
echo "" | tee -a $KF_INSTALL_LOG
echo "The installation will take a while, and there will be some time needed to create the pods." | tee -a $KF_INSTALL_LOG
echo "In a few minutes, check the resources deployed correctly in namespace 'kubeflow' like so:" | tee -a $KF_INSTALL_LOG
echo "" | tee -a $KF_INSTALL_LOG
echo "   $ kubectl get all -n kubeflow" | tee -a $KF_INSTALL_LOG
echo "" | tee -a $KF_INSTALL_LOG
echo "Until then you can run this to see if all pods have been created: " | tee -a $KF_INSTALL_LOG
echo "   $ ./check_status.sh" | tee -a $KF_INSTALL_LOG
echo "" | tee -a $KF_INSTALL_LOG
