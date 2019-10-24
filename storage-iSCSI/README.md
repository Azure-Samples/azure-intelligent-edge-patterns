# Azure Stack Extended Storage (Connect to iSCSI Storage)

***This template is intended for use in an Azure Stack environment.***

The purpose of this template is to offer a solution to connect an Azure Stack VM to an on-premises iSCSI target enabling that VM to utilize off stamp storage hosted else where in your datacenter. This document covers using a Windows machine as the iSCSI target, you can of course also connect to SAN hosted iSCSI storage but that is not coverd in this document.

This template has been designed to setup up the infrastructure necessary on the Azure Stack side to connect to an iSCSI target.  This includes a virtual machine that will act as the iSCSI Initiator along with its accompanying VNet, NSG, PIP and storage. After the template has been deployed two PowerShell scripts need to be run to complete the configuration. One script will be run on the on premise vm(target) and one will be run on the Azure Stack vm (Initiator). Once these are completed you will have on premise storage added to your Azure Stack vm.  

## Overview

This diagram shows a VM hosted on Azure Stack with an iSCSI mounted disk from a Windows Machine on premises (physical or virtual) allowing storage external to Azure Stack to be mounted inside you Azure Stack hosted VM over the iSCSI protocol

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/Overview.jpg)

## Requirements

- An on premise machine (physical or virtual)running Windows Server 2016 Datacenter or Windows Server 2019 Datacenter
- Required Azure Stack Marketplace items:
    -  Windows Server 2016 Datacenter or Windows Server 2019 Datacenter (latest build recommended)
	-  PowerShell DSC extension
    -  Custom Script Extension

## Things to Consider

- A Network Security Group is applied to the template Subnet.  It is recommended to review this and make additional allowances as needed.
- An RDP Deny rule is applied to the Tunnel NSG and will need to be set to allow if you intend to access the VMs via the Public IP address
- This solution does not take into account DNS resolution
- You should change your chap username and chappassword.  The Chappassword must be 12 to 16 characters in length.
- This template is using BYOL Windows License
- This template is using a F8s_v2 vm as default there other options but you many want to change the allowed values.   Validate performance before reducing the VM size.

## Optional

- You can use your own Blob storage account and SAS token using the _artifactsLocation and _artifactsLocationSasToken parameters the ability to use your own storage blob with SAS token.
- This template provides default values for VNet naming and IP addressing.  You will need to change the address space.
- Be careful to keep these values within legal subnet and address ranges as deployment may fail.  
- The powershell DSC package is executed on each RRAS VM and installing routing and all required dependent services and features.  This DSC can be customized further if needed. These are the two DSC packages present https://github.com/PowerShell/ComputerManagementDsc/

## Resource Group Template (iSCSI Client)

This is the detailed diagram of the resources deployed from the template to create the iSCSI client you can use to connect to the iSCSI target.  This template will deploy the VM and other resources, in addition it will run the prepare-iSCSIClient.ps1 and reboot the VM.

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/iSCSIFileServer.jpg)

## The Deployment process

Now we have an understanding of the architecture it is import to understand the deployment process.  The resource group template will generate output which is meant to be the input for the next step as input.  It is mainly focus on the server name and the Azure stack public IP address where the iSCSI traffic comes from.

### Process Example

For this example lets say we want to deploy connect an Azure Stack VM to a vm hosted elsewhere in your datacenter. You would need to deploy the infrastructure template first. Then run the Create-iSCSITarget.ps1 using the IP address and server name outputs from the template as inout parameters for the script on the iSCSI target which can be a virtual machine or physical server.  Next you would use the external IP address or adresses of the iSCSI Target server as inputs to run the Connect-toiSCSITarget.ps1 script.  

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/TheProcess.jpg)

### Deployment Steps

1. Deploy iSCSI client Infrastructure using azuredeploy.json
2. Run Create-iSCSITarget.ps1 on the on premise server iSCSI target
3. Run Connect-toiSCSITarget.ps1 on the on iSCSI client

### Inputs for azuredeploy.json

|**Parameters**|**default**|**description**|
|------------------|---------------|------------------------------|
|WindowsImageSKU         |2019-Datacenter   |Please select the base Windows VM image
|VMSize                  |Standard_D2_v2    |Please enter the VM size
|VMName                  |FileServer        |VM name
|adminUsername           |storageadmin      |The name of the Administrator of the new VM
|adminPassword           |                  |The password for the Administrator account of the new VMs. Default value is subscription id
|VNetName                |Storage           |The name of VNet.  This will be used to label the resources
|VNetAddressSpace        |10.10.0.0/23      |Address Space for VNet
|VNetInternalSubnetName  |Internal          |VNet Internal Subnet Name
|VNetInternalSubnetRange |10.10.1.0/24      |Address Range for VNet Internal Subnet
|InternalVNetIP          |10.10.1.4         |Static Address for the internal IP of the File Server.
|_artifactsLocation      ||
|_artifactsLocationSasToken||

## Adding iSCSI storage to existing VMs

You can also run the scripts on an existing Virtual Machine to connect from the iSCSI client to a iSCSI target.  This flow is if you are creating the iSCSI target yourself.  This diagram shows the execution flow of the PowerShell scripts. These scripts can be found in the Script directory

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/ScriptFlow.jpg)

### Prepare-iSCSIClient.ps1

This script installs the prerequistes on the iSCSI client, this includes;
- installation of Multipath-IO services
- setting the iSCSI initiator service startup to automatic
- enabling support for multipath MPIO to iSCSI
- Enable automatic claiming of all iSCSI volumes
- Set the disk timeout to 60 seconds

It is important to reboot the system after installation of these prerequistes.  The MPIO load balancing policy requires a reboot so that it can be set.

### Create-iSCSITarget.ps1

This script is to be run on the system which is serving the storage.  You can create multiple disks and tagerts restricted by initiators.  You can run this script multiple times to create many virtual disks you can attach to different targets.  You can connect mutli disks to one target. 

|**Input**|**default**|**description**|
|------------------|---------------|------------------------------|
|RemoteServer         |FileServer               |The name of the server connecting to the iSCSI Target
|RemoteServerIPs      |1.1.1.1                  |This is the IP Address the iSCSI traffic will be coming from
|DiskFolder           |C:\iSCSIVirtualDisks     |This is the folder and drive where the virtual disks will be stored
|DiskName             |DiskName                 |This is the name of the disk VHDX file
|DiskSize             |5GB                      |This is the VHDX disk size
|TargetName           |RemoteTarget01           |This is the target name used to define the target configuration for the iSCSI client. 
|ChapUsername         |username                 |This is the username name for Chap authentication
|ChapPassword         |userP@ssw0rd!            |This is the password name for Chap authentication. It must be 12 to 16 characters

### Connect-toiSCSITarget.ps1

This is the final script which is run on the iSCSI client and mounts the disk presented by the iSCSI target to the iSCSI client.

|**Input**|**default**|**description**|
|------------------|---------------|------------------------------|
|TargetiSCSIAddresses   |"2.2.2.2","2.2.2.3"    |The IP addresses of the iSCSI target
|LocalIPAddresses       |"10.10.1.4"            |This is internal IP Address the iSCSI traffic will be coming from
|LoadBalancePolicy      |C:\iSCSIVirtualDisks   |This is the IP Address the iSCSI traffic will be coming from
|ChapUsername           |username               |This is the username name for Chap authentication
|ChapPassword           |userP@ssw0rd!          |This is the password name for Chap authentication. It must be 12 to 16 characters

## Walkthrough

A detailed walkthrough for some iSCSI storage examples can be found here.  In addition there are some steps for reviewing the iSCSI connections and show that mulitpathing is setup.
https://github.com/lucidqdreams/azure-intelligent-edge-patterns/blob/master/rras-vnet-vpntunnel/Source/ExtendingYourStorageUsingiSCSI.docx?raw=true