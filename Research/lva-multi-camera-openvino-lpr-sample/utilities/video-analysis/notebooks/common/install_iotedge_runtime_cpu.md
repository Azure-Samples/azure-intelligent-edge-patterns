# Install IoT Edge Runtime for CPU Accelerated IoT Edge Devices
If you are using a virtual machine, you can use the SSH connection string located in the [.env file](.env) to create a terminal session over the VM. Alternatively, with your own preference of connection type, open a terminal window session on the IoT Edge device. The commands in the steps below should be executed on the IoT Edge device through the terminal session.

To be able to run commands below, you need to install the `curl` command line tool in case it is not already installed. To install curl, please use the following command:

```shell
sudo apt-get -y install curl
```

## Install the Azure IoT Edge Runtime

To install the IoT Edge Runtime, in order run the below commands in the terminal window. Be sure the following URL in the below commands reflects the right version of your OS in the IoT Edge Device:  
```
https://packages.microsoft.com/config/ubuntu/<YOUR_OS_VERSION>/multiarch/prod.list
```

Commands to install the IoT Edge Runtime:

```shell
curl https://packages.microsoft.com/config/ubuntu/18.04/multiarch/prod.list > ./microsoft-prod.list

sudo cp ./microsoft-prod.list /etc/apt/sources.list.d/

curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg

sudo cp ./microsoft.gpg /etc/apt/trusted.gpg.d/

sudo apt-get -y update

sudo apt-get -y install moby-engine

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