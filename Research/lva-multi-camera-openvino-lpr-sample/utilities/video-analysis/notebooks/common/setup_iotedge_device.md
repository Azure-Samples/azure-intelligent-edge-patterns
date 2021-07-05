## Setup the IoT Edge device
This tutorial is adopted from the Microsoft tutorial on [installing Azure ioT Edge runtime on Debian-based Linux systems](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux). In this section, we will summarize and show you the required steps to run this sample.

For this sample, you need an IoT Edge device with following features:  
- AMD64 (x64) hardware architecture
  - We tested this sample on an Intel NUC NUC6CAYH Mini PC, with Intel Quad-Core Celeron J3455 1.5GHz, 8GB DDR3L, and 250GB SSD
- Debian-based Linux system 
  - We test this sample with Ubuntu 18.04 LTS
- Connection to the Internet over ethernet or Wifi  
- Connection to an IP camera where over RTSP protocol  
- Optional: Intel Accelerator (i.e., Myriad VPU)
  - We tested this sample with Intel Neural Compute Stick 2, connected to the NUC PC through USB port

> <span> [!TIP] </span>  
> - You can work directly on the IoT Edge device by connecting a monitor, a keyboard, and other accessories. Alternatively, you can use a remote desktop accessibility feature to access your IoT Edge device remotely from your development PC.  
> - You can test whether your IoT Edge device is connected to the internet by using the `ping` tool (i.e., `ping www.microsoft.com`) or by opening a browser on Ubuntu to access your favorite website.  
> - You can use a video player like VLC to check if the IP camera is accessible from the IoT Edge device. Inside the IoT Edge device, open VLC and try to play an IP camera stream by specifiying its RSTP address.  

### Install the Azure IoT Edge Runtime on Debian-Based Linux Systems  
> <span style="color:red; font-weight: bold; font-size:1.1em;"> [!IMPORTANT] </span>  
> Everything in **this section** of the sample must be run on the IoT Edge device.

At the end of the [previous section](create_azure_services.ipynb), we printed out the IOT_HUB_CONN_STRING connection string. This string contains sensitive information like the credentials used to make a connection between the IoT Hub on the Cloud and the physical IoT Edge device on thhe Edge. This connection string is also saved in the .env file. In the rest of the sample, we will refer to that string as IOT_HUB_CONN_STRING, and we will be using it to set up our IoT Edge device.

#### Install the Azure IoT Edge Runtime
Open a terminal window on your Edge device. Run the following shell commands inside the terminal window to install IoT Edge Runtime on your Edge device.

To be able to run below commands, you need to install the `curl` command line tool in case it is not already installed. To install it, please use the following command:

```shell
sudo apt-get -y install curl
```

To install IoT Edge Runtime, run the following commands in the terminal window.

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

Now continue running the following shell commands by replacing the placeholder <IOT_EDGE_DEVICE_CONN_STRING> in the below commands with the IoT Edge Device connection string value mentioned above.

```shell
iotHubConnStr="<IOT_EDGE_DEVICE_CONN_STRING>"
configFile=/etc/iotedge/config.yaml
sudo sed -i "s#\(device_connection_string: \).*#\1\'$iotHubConnStr\'#g" $configFile
sudo systemctl restart iotedge
```  

#### Check IoT Edge Runtime Configuration
Run the following shell command to see if your IoT Edge Runtime configuration was set correctly.

```shell
sudo iotedge check
```

The command above will print out a check report. Any warning or error in this report needs to be addressed.

Here are some functionally critical settings needed:  
#### Set DNS Server IP addresses  
Follow [these instructions](https://docs.microsoft.com/en-us/azure/iot-edge/troubleshoot#edge-agent-module-continually-reports-empty-config-file-and-no-modules-start-on-the-device) for more details.  

Create a daemon file to enter your DNS server addresses. We use text editor "nano". If you don't have it, either install or use your prefered text editor.
```shell
sudo nano /etc/docker/daemon.json
```

Enter the following text inside the daemon file. We use DNS server IP address 8.8.8.8

```json
{
    "dns": ["8.8.8.8"]
}
```
Save and exit from editor. Restart the IoT Edge Runtime to have the changes take affect.

```shell
sudo systemctl restart docker
```

Now we should not get DNS warnings anymore in the check report.  

#### Check Hostname
> <span style="color:red; font-weight: bold; font-size:1.1em;"> [!IMPORTANT] </span>  
> Your IoT Edge device's original hostname and the hostname in the "/etc/iotedge/config.yaml" file must be same. Moreover it is **very important** to have this name in lowercase characters without special characters like ! and *.  