# Install IoT Edge runtime for NVidia GPU Accelerated IoT Edge Devices

This section assumes that your PC have NVidia Tesla K80 GPU card installed and you are using Ubuntu OS version 18.04. For other operating system versions and GPU types, the commands below may need to be updated (e.g., find the appropriate GPU drivers for your Edge device).

If you are using a virtual machine, you can use the SSH connection string located in the [.env file](.env) to create a terminal session over the VM. Alternatively, with your own preference of connection type, open a terminal window session on the IoT Edge device. The commands in the steps below should be executed on the IoT Edge device through the terminal session.

## Install NVidia Cuda Drivers for your nGPU (Tesla K80 in this case)
First, install the `curl` command line tool on your Iot Edge device's terminal.

```shell
sudo apt-get -y install curl
```

Next, install the drivers for your nGPU. Note that the installation may take a few minutes. You can learn more about installing [NVidia drivers](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/n-series-driver-setup) for your nGPU here.


```shell
wget -O /tmp/cuda-repo-ubuntu1804_10.0.130-1_amd64.deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-repo-ubuntu1804_10.0.130-1_amd64.deb 

sudo dpkg -i /tmp/cuda-repo-ubuntu1804_10.0.130-1_amd64.deb

sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub 

rm -f /tmp/cuda-repo-ubuntu1804_10.0.130-1_amd64.deb

sudo apt-get -y update

sudo apt-get install -y cuda-drivers

sudo reboot
```

## Install Docker Engine on Ubuntu
After your IoT Edge device restarts (the last command above restarts it), install Docker engine by running the code snippets bellow. You can learn more about [Docker engine](https://docs.docker.com/engine/install/ubuntu/) here.

```shell
sudo apt-get update

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo apt-key fingerprint 0EBFCD88

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"

sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

## Install NVIDIA Container Toolkit
Follow the instructions listed on the [NVidia Docker 2](https://github.com/NVIDIA/nvidia-docker#upgrading-with-nvidia-docker2-deprecated) Github repo.

> <span>[!NOTE]</span>
> Take note of the following statement on "nvidia-docker" website:
> "Note that in the future, nvidia-docker2 packages will no longer be supported."

Since current version of IoT Edge Runtime (1.0.9) supports this V2, we are going with it for now.

```shell
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -

curl -s -L https://nvidia.github.io/nvidia-docker/ubuntu18.04/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update

sudo apt-get install -y nvidia-docker2

sudo systemctl restart docker
```

## Test the Installation and Access to GPU Within a Container
<!-- # sudo docker run --gpus all nvidia/cuda:10.0-base nvidia-smi -->
```shell
sudo docker run --runtime nvidia nvidia/cuda:10.0-base nvidia-smi
```

## Install the Azure IoT Edge Runtime
In order to run the commands below in the terminal window, be sure to update the URL with the appropriate OS for your IoT Edge Device:  

https://packages.microsoft.com/config/ubuntu/<YOUR_OS_VERSION>/multiarch/prod.list


Commands to install the IoT Edge Runtime:

```shell
curl https://packages.microsoft.com/config/ubuntu/18.04/multiarch/prod.list > ./microsoft-prod.list

sudo cp ./microsoft-prod.list /etc/apt/sources.list.d/

curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg

sudo cp ./microsoft.gpg /etc/apt/trusted.gpg.d/

sudo apt-get -y update

sudo apt-get -y install iotedge
```

## Configure the IoT Edge Runtime Service
You need to configure the IoT Edge Runtime service, so it will connect to the IoT Hub service in the Cloud. To do so, you need IoT Edge Device connection string, which looks like something:  

```
HostName=mkov01iothub.azure-devices.net;DeviceId=mkov01iotdevid;SharedAccessKey=QK+TiYdf1WJQJf5..........oczt1S634yI=  
```  

Your IoT Edge Device connection string value is stored in the [.env file](.env) with the following key: IOT_EDGE_DEVICE_CONN_STRING   

Now continue running the following shell commands by replacing the placeholder <IOT_EDGE_DEVICE_CONN_STRING_FROM_.ENV_FILE> in the below commands with the IoT Edge Device connection string value mentioned above.

```shell
IOT_EDGE_DEVICE_CONN_STRING="<IOT_EDGE_DEVICE_CONN_STRING_FROM_.ENV_FILE>"

configFile=/etc/iotedge/config.yaml

sudo sed -i "s#\(device_connection_string: \).*#\1\'$IOT_EDGE_DEVICE_CONN_STRING\'#g" $configFile

sudo systemctl restart iotedge
```  

## Restart the machine
Run the following command in the terminal window to the IoT Edge device:

```shell
sudo reboot
```
