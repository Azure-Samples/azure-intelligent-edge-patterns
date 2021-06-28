#!/usr/bin/env bash

# This script is intended as an initialization script used in azuredeploy.json
# See documentation here: https://docs.microsoft.com/zh-tw/azure/virtual-machines/extensions/features-linux
# Run with sudo
# comments below:

# Username as argument
adminUser=$1

WD=/home/$adminUser/

# Sleep to let Ubuntu install security updates and other updates
sleep 1m

echo WD is $WD

if [ ! -d $WD ]; then
    echo $WD does not exist - aborting!!
    exit
else
    cd $WD
    echo "Working in $(pwd)" > install-log.txt
fi

# Set permissions so we can write to log
sudo chmod ugo+rw install-log.txt


export DEBIAN_FRONTEND=noninteractive
echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Ubuntu 18.04, CUDA 11.3, cuDNN 8.2.0 and NVIDIA 465.19 drivers
# https://github.com/kaka-lin/ML-Notes/blob/master/TensorFlow/document/nvidia.md
# 1. remove/uninstall NVIDIA driver & CUDA
sudo rm /etc/apt/sources.list.d/cuda*
sudo apt remove -y --autoremove nvidia-cuda-toolkit
sudo apt remove -y --autoremove nvidia-*
sudo apt update
sudo add-apt-repository -y ppa:graphics-drivers/ppa
sudo apt update

## 2. Add NVIDIA package repositories
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-repo-ubuntu1804_10.2.89-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu1804_10.2.89-1_amd64.deb
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub
sudo apt-get update

wget http://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1804/x86_64/nvidia-machine-learning-repo-ubuntu1804_1.0.0-1_amd64.deb
sudo apt install -y ./nvidia-machine-learning-repo-ubuntu1804_1.0.0-1_amd64.deb
sudo apt update

## 3. Install NVIDIA driver
sudo apt install -y --no-install-recommends nvidia-driver-465
# Reboot. Check that GPUs are visible using the command: nvidia-smis

## 4. Install development and runtime libraries (~4GB)
sudo apt-get install -y --no-install-recommends \
    cuda-11-3 \
    libcudnn8=8.2.0.53-1+cuda11.3  \
    libcudnn8-dev=8.2.0.53-1+cuda11.3

echo 'export CUDA_HOME="/usr/local/cuda"' >> ~/.bashrc
echo 'export PATH="$CUDA_HOME/bin:$PATH"' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda-11.3/lib64"' >> ~/.bashrc
source ~/.bashrc

# Install nvidia-docker
# https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker

## 1. Setting up Docker
curl https://get.docker.com | sh \
  && sudo systemctl --now enable docker

## 2. Setup the stable repository and the GPG key:
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
   && curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - \
   && curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

## 3. Setting up NVIDIA Container Toolkit
curl -s -L https://nvidia.github.io/nvidia-container-runtime/experimental/$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list

## 4. Install the nvidia-docker2 package (and dependencies)
##    after updating the package listing
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
