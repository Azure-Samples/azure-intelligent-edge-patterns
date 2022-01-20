#!/usr/bin/env bash
set -euo pipefail

install() {
  echo "Running Kubeflow install script"
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
      --kfctl_release_filename)
        KFCTL_RELEASE_FILENAME="$2"
        echo "set kfctl_release_filename to ${KFCTL_RELEASE_FILENAME}"
        shift
       ;;
      --kfctl_release_uri)
        KFCTL_RELEASE_URI="$2"
        echo "set kfctl_release_uri to ${KFCTL_RELEASE_URI}"
        shift
        ;;
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
      --kf_config_uri)
        KF_CONFIG_URI="$2"
        echo "set kf_config_uri to ${KF_CONFIG_URI}"
        shift
        ;;
      --help|*)
        echo "Options:"
        echo "        --kf_ctl_dir"
        echo "        --kf_name"
        echo "        --kf_username"
        echo "        --kfctl_release_filename"
        echo "        --kfctl_release_uri"
        echo "        --kf_dir_base"
        echo "        --kf_config_uri"
        echo "        --help"
        exit 1
        ;;        
    esac
    shift
  done

  echo "------------------------"
  echo "KF_CTL_DIR: $KF_CTL_DIR"
  echo "KF_NAME: $KF_NAME" 
  echo "KF_USERNAME: $KF_USERNAME" 
  echo "KFCTL_RELEASE_FILENAME: $KFCTL_RELEASE_FILENAME"
  echo "KFCTL_RELEASE_URI: $KFCTL_RELEASE_URI"
  KF_DIR=${KF_DIR_BASE}/${KF_NAME}
  echo "KF_DIR_BASE: $KF_DIR_BASE"
  echo "KF_DIR: $KF_DIR"
  echo "KF_CONFIG_FILENAME=: $KF_CONFIG_FILENAME"
  echo "KF_CONFIG_URI=: $KF_CONFIG_URI"

  #echo `whoami`
  #echo "USER $USER"

  #echo "#--- Kubeflow config" >> ~/.bashrc
  #echo "export PATH=\$PATH:${KF_CTL_DIR}" >> ~/.bashrc
  #echo "export KF_DIR=${KF_DIR}" >> ~/.bashrc
  #echo "export KF_CONFIG_FILENAME=${KF_CONFIG_FILENAME}" >> ~/.bashrc
  #echo "#--- Kubeflow config end" >> ~/.bashrc

  echo "Creating the dir for kfctl, $KF_CTL_DIR"
  mkdir -p $KF_CTL_DIR || exit 2
  cd $KF_CTL_DIR  || exit 2
  wget -q $KFCTL_RELEASE_URI || exit 2
  #curl -O $KFCTL_RELEASE_URI || exit 2
  tar -xvf ${KFCTL_RELEASE_FILENAME} || exit 2
  # porter
  #sudo mkdir -p ${KF_DIR} || exit 2
  mkdir -p ${KF_DIR} || exit 2
  # porter
  #sudo chown ${KF_USERNAME} ${KF_DIR}  || exit 2
  chown ${KF_USERNAME} ${KF_DIR}  || exit 2

  cd ${KF_DIR}  || exit 2
  echo `pwd`
  echo "$KF_CTL_DIR/kfctl apply -V -f ${KF_CONFIG_URI}"
  $KF_CTL_DIR/kfctl apply -V -f ${KF_CONFIG_URI}  || exit 2
}

uninstall() {
  echo "Running Kubeflow uninstall script"
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
      --help|*)
        echo "Options:"
        echo "        --kf_ctl_dir"
        echo "        --kf_name"
        echo "        --kf_username"
        echo "        --kf_dir_base"
        echo "        --help"
        exit 1
        ;;
    esac
    shift
  done
  echo "KF_CTL_DIR: $KF_CTL_DIR"
  echo "KF_NAME: $KF_NAME"
  KF_DIR=${KF_DIR_BASE}/${KF_NAME}
  echo "KF_DIR_BASE: $KF_DIR_BASE"
  echo "KF_DIR: $KF_DIR"
  echo "KF_CONFIG_FILENAME=: $KF_CONFIG_FILENAME"
  cd ${KF_DIR} || exit 2
  # might need to download this file first.
  $KF_CTL_DIR/kfctl delete -f ${KF_DIR}/${KF_CONFIG_FILENAME}
}

# Call the requested function and pass the arguments as-is
"$@"
