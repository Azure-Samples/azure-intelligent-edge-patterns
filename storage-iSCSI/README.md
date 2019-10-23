# AzureStack Connect iSCSI Storage

***This template is intended for use in an Azure Stack environment.***

The purpose of this template is to offer a solution to connect an Azure Stack vm to an on-premises iSCSI target enabling that Azure Stack vm to use on premise storage.  

This template has been designed to setup up the infrastructure necessary on the Azure Stack side to connect to an iSCSI target.  This includes a virtual machine that will act as the iSCSI Initiator along with its accompanying VNet, NSG, PIP and storage. After the template has been deployed two PowerShell scripts need to be run to complete the configuration. One script will be run on the on premise vm(target) and one will be run on the Azure Stack vm (Initiator). Once these are completed you will have on premise storage added to your Azure Stack vm.
## Infrastructure Overview

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/iSCSIFileServer.jpg)

## The deployment process

Now we have an understanding of the architecture it is import to understand the deployment process.  The infrastructure template will generate output which is meant to be the input for the tunnel template.

### Process Example

For this example lets say we want to deploy connect an Azure Stack vm to a vm hosted on VMWare on premise. You would need to deploy the infrastructure template first. Then run the Create-iSCSITarget.ps1 script on the VMWare on premise vm using the output from the infrastrucutre template. Next you would use the IP address of the on premise VMWare vm and run the Connect-toiSCSITarget.ps1 script.  

![alt text](https://raw.githubusercontent.com/lucidqdreams/azure-intelligent-edge-patterns/master/storage-iSCSI/Images/TheProcess.jpg)

### Deployment Steps

1. Deploy Infrastructure using azuredeploy.json
2. Run Create-iSCSITarget.ps1 on the on premise server
3. Run Connect-toiSCSITarget.ps1 on the on premise server

## Requirements

- An on premise virtual machine running Windows Server 2016 Datacenter or Windows Server 2019 Datacenter
- Required Azure Stack Marketplace items:
    -  Windows Server 2016 Datacenter or Windows Server 2019 Datacenter (latest build recommended)
	-  PowerShell DSC extension
    -  Custom Script Extension

## Template Inputs & Outputs

There are several JSON parameters files with default values to assist you in deploying this in your own environments.

### Inputs for azuredeploy.json

|**Parameters**|**default**|**description**|
|------------------|---------------|------------------------------|
|WindowsImageSKU         |2019-Datacenter   |Please select the base Windows VM image
|VMSize                  |Standard_F8s_v2   |Please select the VM size
|VMName                  |FileServer        |VM name
|adminUsername           |storageadmin      |The name of the Administrator of the new VM
|adminPassword           |Subscription id   |The password for the Administrator account of the new VMs. Default value is subscription id
|VNetName                |Storage           |The name of VNet.  This will be used to label the resources
|VNetAddressSpace        |10.10.0.0/23      |Address Space for VNet
|VNetInternalSubnetName  |Internal          |VNet Internal Subnet Name
|VNetInternalSubnetRange |10.10.1.0/24      |Address Range for VNet Internal Subnet
|InternalVNetIP          |10.10.1.4         |Static Address for the internal IP of the File Server.
|_artifactsLocation      ||
|_artifactsLocationSasToken||

### Outputs from azuredeploy.json

|**Output**|
|-------------|
|VMName
|PublicEndpoint
|LocalVNetAddressSpace
|adminUsername
|VNet
|InternalRefVNet
|VNetInternalSubnetName
|InternalSubnetRefVNet
|InternalSubnetIP

### Inputs for Create-iSCSITarget.ps1

|**Inputs**|**Outputs from azuredeploy.json**|
|-------------|-----------|
|$RemoteServerIPs|PublicEndpoint|



### Inputs for Connect-toiSCSITarget.ps1

|**Inputs**|**Outputs from Connect-toiSCSITarget.ps1**|
|-------------|-----------|
|IP address of on premise iSCSI target vm|$TargetPortalAddresses|
|IP address of Azure Stack iSCSI initiator vm|$LocaliSCSIAddresses|


## Things to Consider

- A Network Security Group is applied to the template Tunnel Subnet.  It is recommended to secure the internal subnet in each VNet with an additional NSG.
- An RDP Deny rule is applied to the Tunnel NSG and will need to be set to allow if you intend to access the VMs via the Public IP address
- This solution does not take into account DNS resolution
- The resource group name is used for the VM and for the route table so that the Tunnel template can find the RRAS VM and RouteTable resources easily without user input.  The user can however label the VNet and Subnets to make this more relervant to its usage.
- The combination of Resource Group and vmName must be less than 15 characters.  Eg 'Resourcegr-RRAS'
- This template is using BYOL Windows License
- When deleting the resource group, currently on (1907) you have to manually detach the NSG's from the tunnel subnet to ensure the delete resource group completes
- This template is using a DS3v2 vm as default there other options but you many want to change the allowed values.  The RRAS service installs and run Windows internal SQL Server.  This can cause memory issues if your VM size is too small.  Validate performance before reducing the VM size.
- This is not a highly avaliable solution.  If you require a more HA style solution you can add a second VM, you would have to manually Change the route in the route table to the internal IP of the secondary interface.  You would also need to configure the mutliple Tunnels to cross connect.

## Optional

- You can use your own Blob storage account and SAS token using the _artifactsLocation and _artifactsLocationSasToken parameters the ability to use your own storage blob with SAS token.
- This template provides default values for VNet naming and IP addressing.  You will need to change the address space.
- Be careful to keep these values within legal subnet and address ranges as deployment may fail.  
- The powershell DSC package is executed on each RRAS VM and installing routing and all required dependent services and features.  This DSC can be customized further if needed. These are the two DSC packages present https://github.com/PowerShell/ComputerManagementDsc/ https://github.com/mgreenegit/xRemoteAccess/.  xRemoteAccess is present but not used currently.
- The custom script extension runs the following script Add-Site2SiteIKE.ps1 and Add-Site2SiteGRE.ps1 and configures the VPNS2S tunnel between the two RRAS servers.  You can view the detailed output from the custom script extension to see the results of the VPN tunnel configuration

## Walkthrough

A detailed guide for the Mutliple VPN tunnel walkthrough can be found here
https://github.com/lucidqdreams/azure-intelligent-edge-patterns/blob/master/rras-vnet-vpntunnel/Source/Walkthrough-Multiple-VPN-Tunnels.docx?raw=true