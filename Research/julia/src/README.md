### TO DO : UPDATE DOCUMENTATION LINKS BEFORE RELEASE, THEY ARE CURRENTLY INTERNAL ONLY
Julia Lieberman

This tutorial will walk you through setting up an Azure Stack Edge device and deploying the following modules:
-Live Video Analytics
-RTSP simulation
-Yolo V3 machine learning model to detect objects

You can choose to set this up so the RTSP simulation videos are uploaded to the cloud or used locally. This tutorial will set things up to run locally.

PART 1: SETUP THE AZURE STACK EDGE
NOTE: don't generate your own certificates when running through the instructions
	• Complete steps 0-3 after reading the following notes:
		○ In step 1 you can select Azure Stack Edge with FPGA
		○ It's ok to say ship to United States! When you get to the shipping address section you can select "I already have a device"
		○ REMEMBER THE NAME OF THE RESOURCE GROUP YOU USE! And make sure that whenever asked to choose a location you use WEST US 2 as this is the only supported location for Live Video Analytics as of July 2020
	• Enable compute network
		○ I used port 3, and found my address space in the source code under src\Productization\WdsScripts\ApplianceInfo.xml (identifiable by my preassigned device name DL112-Clus)
		○ Provide at least three Kubernetes external service IPs in your local UI network settings- you'll need one per module you deploy. In this tutorial you only really need two but it's still a good idea
		○ When you hit apply, be patient! It may take 6-10 minutes to succeed
		○ Configure web proxy section is optional
	• Configure device settings (you only need to do this section, the update and time sections are optional)
	• If you didn't already get an activation key from the Azure Portal, follow these steps
	• Activate your device!
		○ I have never used the secret keys, no need to download them at this point
	• Configure Compute from the Azure Portal
		○ Remember your IoT Hub name here!
		○ Follow the steps to add a share
			§ You'll need to point to or create a storage account here. Remember the storage account name, this will be important later! Make sure it is set up with location = West US 2
	
Now let's make sure you can connect to your device from your local machine
	• Open a powershell window and type
		○ notepad C:\Windows\System32\drivers\etc\hosts
		○ This opens the hosts file. Here you will add two entries
			§ <device IP> <device name>
			§ <Kubernetes API service IP> <Kubernetes API service endpoint>


PART 2: SET UP LVA RESOURCES:
Prerequisites: 
	• Azure account with an active subscription (that you used with your ASE)
		○ You must have Owner level permissions on the subscription to set up LVA!
	• Visual Studio Code on your development machine. Make sure you have the Azure IoT Tools extension as well as the C# one
	• You’ll also need the .NET Core 3.1 SDK
	• Make sure the network that your development machine is connected to permits Advanced Message Queueing Protocol (AMQP) over port 5671. This setup enables Azure IoT Tools to communicate with Azure IoT Hub.
Clone this repo to your local machine
Open up a cloud shell and run the following commands: 
	1. mkdir lva-sample-on-ase
	2. cd lva-sample-on-ase
	3. curl -X GET https://raw.githubusercontent.com/julialieberman/demoSite/master/mysetup.sh > setup.sh
	4. chmod +x setup.sh
	5. ./setup.sh
The script will prompt you for a few things, including the subscription, the resource group, a container registry name, a storage account name, and a media services account name. If you already have such resources in the resource group, the script will find them for you and make sure you want to use those.
When this is done running, expand the {} brackets in the upper left of the Cloud Shell to see your files. There should be an appsettings.json file inside the lva-sample-on-ase folder you created, make sure it looks like this:
{
    "IoThubConnectionString" : "HostName=<HOSTNAME>.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=<YOUR_KEY>",
    "deviceId" : "<DEVICE_ID>",
    "moduleId" : "lvaEdge"
}

VS Code
Open your local clone of this git repository in Visual Studio Code, have the Azure Iot Tools extension installed.

Open the file src/cloud-to-device-console-app/appsettings.json and paste the contents from the cloud shell appsettings.json file

Copy the values from the edge-deployment/.env file created in your cloud shell to the /src/edge/.env file in VS Code
Change the names of "INPUT_VIDEO_FOLDER_ON_DEVICE" and "OUTPUT_VIDEO_FOLDER_ON_DEVICE" to the name of your local compute-enabled share from the Azure Stack Edge. 
Change the name of the APPDATA_FOLDER_ON_DEVICE to the name of your compute share.
Save all modified files


Connect to your IoTHub:
	1. In Visual Studio Code, select View > Explorer. Or select Ctrl+Shift+E.
	2. In the lower-left corner of the Explorer tab, select Azure IoT Hub.
	3. Select the More Options icon to see the context menu. Then select Set IoT Hub Connection String.
	4. When an input box appears, enter your IoT Hub connection string. Copy and paste the "IoThubConnectionString" value from the appsettings.json file you just made in the cloud shell. Alternatively, in the Azure Portal you can find this under your IoT Hub àSettingsàShared access policiesàiothubowneràconnection string – primary key.

If the connection succeeds, the list of edge devices appears. You should see at least one device with the name of your ASE. You can now manage your IoT Edge devices and interact with Azure IoT Hub through the context menu. To view the modules deployed on the edge device, under your device, expand the Modules node.

• Right click on src/edge/deployment.template.json and select “Generate Iot Edge deployment manifest”. This will create an IoT Edge deployment manifest file in src/edge/config folder named deployment.amd64.json.
• Right click on src/edge/config /deployment.amd64.json and select "Create Deployment for single device" and select the name of your edge device. This will trigger the deployment of the IoT Edge modules to your Edge device. You can view the status of the deployment in the Azure IoT Hub extension (expand 'Devices' and then 'Modules' under your IoT Edge device).
• Right click on your edge device in Azure IoT Hub extension and select "Start Monitoring Built-in Event Endpoint".
• Start a debugging session (hit F5). You will start seeing some messages printed in the TERMINAL window. In the OUTPUT window, you will see messages that are being sent to the IoT Hub by the Live Video Analytics on IoT Edge module.


You should now see five modules, and they should be running. Feel free to refresh, as this may take a minute. 



Now go look at the operations.json file in the cloud-to-device-console-app 
Change all references of 'Julias-Sample-Graph1' to anything of your choice. 

Press F5 to start the program, and hit enter in the terminal as prompted. Wait to hit enter after you see "The topology will now be deactivated"
Go to the output tab and you should see inferences being printed out! Woohoo, it's working! You can see the sample recordings updating in your local share from yor file explorer. Go ahead and hit enter in the terminal when prompted until the program ends. 
Congratulations, you now have LVA running on the ASE!
