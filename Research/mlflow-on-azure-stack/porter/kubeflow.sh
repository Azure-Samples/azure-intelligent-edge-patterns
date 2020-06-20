#!/usr/bin/env bash
set -euo pipefail

install() {
  echo Installing Kubeflow
  
  echo "[INFO] Installing kftctl binary for Kubeflow CLI..."

  echo "       ... Creating directory to store download"
  mkdir -p $KF_CTL_DIR
  cd $KF_CTL_DIR

  echo "       ... Downloading kfctl binary"
  wget -q $KFCTL_RELEASE_URI
  tar -xvf ${KFCTL_RELEASE_FILENAME}

  echo "       ... Creating Kubeflow directory"

  # Set the path to the base directory where you want to store one or more 
  # Kubeflow deployments. For example, /opt/.
  # Then set the Kubeflow application directory for this deployment.
  KF_DIR=${KF_BASE_DIR}/${KF_NAME}   
  mkdir -p ${KF_DIR}
  cd ${KF_DIR}
  
  echo "       ... Installing Kubeflow for deployment: ${KF_NAME}"
  echo "[DEBUG] $KF_CTL_DIR/kfctl apply -V -f ${KF_CONFIG_URI}"
  $KF_CTL_DIR/kfctl apply -V -f ${KF_CONFIG_URI}

}

upgrade() {
  echo "[INFO] Upgrade functionality has not been implemented"
}

uninstall() {
  echo "[INFO] Uninstalling Kubeflow server..."

  echo "[INFO] Installing kftctl binary for Kubeflow CLI..."

  echo "       ... Creating directory to store download"
  mkdir -p $KF_CTL_DIR
  cd $KF_CTL_DIR

  echo "       ... Downloading kfctl binary"
  wget -q $KFCTL_RELEASE_URI
  tar -xvf ${KFCTL_RELEASE_FILENAME}  
  KF_DIR=${KF_BASE_DIR}/${KF_NAME}
  mkdir -p ${KF_DIR}
  cd ${KF_DIR}

  # might need to download this file first.
  wget ${KF_CONFIG_URI}
  ls -la
  cat $KF_CONFIG_FILENAME
  $KF_CTL_DIR/kfctl delete -f ${KF_DIR}/${KF_CONFIG_FILENAME}
}

# Call the requested function and pass the arguments as-is
"$@"