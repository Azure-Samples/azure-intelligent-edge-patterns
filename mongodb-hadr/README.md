Technical guidance

Contents


[1 Overview 1](#overview)

[1.1 Context and Considerations 2](#context-and-considerations)

[2 Prerequisites 2](#Prerequisites)

[3 Before you begin 2](#Before-you-begin)

[4 Reference Architecture 3](#Reference-Architecture)

[4.1 Azure Stack Resources  5](#Azure-Stack-Resources)        

[4.2 Deploying Azure Stack Resources 6](#Deploying-Azure-Stack-Resources)

[4.3 Preparing Parameters  7](#Preparing-Parameters)

[4.4 Deploying Script 10](#Deploying-Script)

[5 Appendix 11](#Appendix)

[5.1 Configuring BGP for Azure Stack Development Kit Only  11](#Configuring-BGP-for-Azure-Stack-Development-Kit-Only)

# Overview

This reference article details environmental requirements and steps for setting up MongoDB HA-DR with Ubuntu on 2 Azure Stack environments.

Data replication provides redundancy and increases [data availability](https://docs.mongodb.com/manual/reference/glossary/#term-high-availability) for MongoDB. With multiple copies of data on different database servers, replication provides a level of fault tolerance against the loss of a single database server.

In some cases, replication can provide increased read capacity as clients can send read operations to different servers. Maintaining copies of data in different data centers (Azure Stack environments) can increase data locality and availability for distributed applications. You can maintain additional copies for dedicated purposes, such as disaster recovery (handled in this automation), reporting, or backup.

##  Context and Considerations

There are some distinctions between one-node Azure Stack Development Kit (ASDK), and multi-node Azure Stack Integrated System (ASIS).

ASDK utilizes a public IP address, while maintaining its own VM with a separate and defined private network.

Azure Stack Integrated System integrates with your datacenter and has an entire IP address range to delegate to the system during installation. This requires some specialized setup and configuration for the Azure stack isolated environment. Software-defined networking requires only four cables connecting an Azure Stack machine to the outside network.

# Prerequisites

**The below prerequisites are applicable for both Azure Stack environments(HA Site and DR Site)**

- An Azure Stack Environment for deploying the MongoDB on Ubuntu.

- For information on how to deploy Azure Stack Development Kit see [ASDK-Install](https://docs.microsoft.com/azure/azure-stack/asdk/asdk-install)

- Azure Stack environment should have access to the linked Arm templates and ubuntu images, over the internet.

- For information on how to deploy Azure Stack Development Kit see [Azure Stack-SQL-Resource-Provider-Deploy](https://docs.microsoft.com/azure/azure-stack/azure-stack-sql-resource-provider-deploy)

- Plans, Offers and Quotas Configured.

- For information on how to configure Quotas, Offers and Plans see [Plan-Offer-Quota-Overview](https://docs.microsoft.com/azure/azure-stack/azure-stack-plan-offer-quota-overview)

- A tenant subscribed to your Azure Stack Offer/Plan.

- For information on how to Subscribe to an offer see. [Subscribe-to-an-Offer](https://docs.microsoft.com/azure/azure-stack/azure-stack-subscribe-plan-provision-vm)

## Before you begin

Verify that you have met the following criteria before beginning your configuration:

- Verify that you have an externally facing public IPv4 address for your VPN device. This IP address cannot run through network address translation (NAT).
- Ensure all resources are deployed in the same region/location.

For more information about VPN Gateway settings in general, see [About VPN Gateway Settings](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings).

**Note: If you are using an ASDK environment please Complete Appendix Section 9.1**

# Reference Architecture

This section details the high reference architecture for MonogDB HADR that can be used as a guidance to implement the templates.

A [_replica set_](https://docs.mongodb.com/manual/replication/) in MongoDB is a group of [mongod](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) processes that maintain the same data set. Replica sets provide redundancy and [high availability](https://docs.mongodb.com/manual/reference/glossary/#term-high-availability), and are the basis for all production deployments.

A replica set in MongoDB contains several data bearing nodes and one arbiter node. Of the data bearing nodes, one and only one member is deemed the primary node, while the other nodes are deemed secondary nodes.

Using this template, we will be deploying an HA site with a primary and a secondary node(2 nodes) along with a arbiter for holding elections.

![Primary-secondary](Primary-secondary.png)

Distributing replica set members across geographically distinct data centers adds redundancy and provides fault tolerance if one of the data centers is unavailable.

To protect your data in case of a data center failure, keep at least one member in an alternate data center. If possible, use an odd number of data centers, and choose a distribution of members that maximizes the likelihood that even with a loss of a data center, the remaining replica set members can form a majority or at minimum, provide a copy of your data.

The below image shows the distribution of the members.

Two data centers: three members to Data Center 1 and two members to Data Center 2. One of the members of the replica set is an arbiter, distribute the arbiter such that one of them is on Data Center 1 and another one on the DR Site, Data Center 2.

- If Data Center 1 goes down, the replica set becomes read-only.
- If Data Center 2 goes down, the replica set remains writeable as the members in Data Center 1 can hold an election.

![replicaset-distribution](Replicaset-distribution.png)
    


## Azure Stack Resources

- **Azure Stack IaaS for Hosting an Ubuntu VM.** Ubuntu on a VM is an image referenced in the template, the template can be used with the default url.
- **Azure Stack Virtual Network.** The Azure Stack Virtual Network, works exactly like the [Azure Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview), and enables many types of Azure resources, such as Azure Virtual Machines (VM), to securely communicate with each other, the internet, and on-premises networks.


  - –– **Application Subnet.** Dividing the Azure Virtual Network into two or more logical, IP subdivisions via subnets provides a custom private IP address space using public and private (RFC
This subnet will be where the majority of the resources will be deployed.

  - –– **Gateway Subnet.** The gateway subnet is part of the virtual network IP address range specified when configuring the virtual network, and contains the IP addresses that the [virtual network gateway](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-create-site-to-site-rm-powershell) resources and services use.

- **Azure Stack Virtual Network Gateway.** Send network traffic between Azure virtual network and an on-premises site by creating a [virtual network gateway.](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-vpn-gateway-about-vpn-gateways)
- **Azure Stack Local Network Gateway.** [The local network gateway typically refers to the on-premises location. Azure refers to the site name and specifies the IP address of the local VPN device to connect to.](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-network)

**Azure Stack Public IP.** The Azure Stack [Public IP addresses](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-network-ip-addresses-overview-arm#public-ip-addresses) work like the Azure Public IP addresses, allowing Internet resources to communicate inbound to Azure resource, and enable Azure resources to communicate outbound to Internet and public-facing Azure services with an IP address assigned to the resource. As note, please work with the Hardware OEM Partners to make Azure Stack services (such as the portals, Azure Resource Manager, DNS, etc.) available to external networks.

# Deploying Azure Stack Resources

The resources deployed on both Sites(HA Site and DR Site) are as follows:

- 1 Virtual network on each Site
- 2 Subnets on each Site – One for Mongo resources, another one for gateway(gateway subnet)
- 2 Ubuntu VM&#39;s, Primary and Secondary (All associated resources i.e. NIC&#39;s, Public IP Addresses, V-Net, etc.). These will be part of an availability set. This is on HA Site.
- 1 Ubuntu VM on the DR Site.
- Arbiter VM, 1 each on HA Site and DR Site(All associated resources i.e. NIC&#39;s, Public IP Addresses,)
- JumpBox VM on HA Site(All associated resources i.e. NIC&#39;s, Public IP Address)
- Network Security Groups on both Sites
- Standard Storage Account on both Sites
- Local Network Gateway on both Sites
- Virtual Network Gateway on both Sites
- Connection – S2S(IPsec) on both Sites

## Preparing Parameters

| **Step** | **Step Details** |
| --- | --- |
| 1 | Download the project and save it to your local machine |
| 2 | Navigate to the folder, and open the **azurestackdeploy.paramaters.json**  fileIt is located in the root folder. |
| 3 | Fill in  **Parameter**   **values**. Below is a description of parameters |

| **Parameter** | **Description** | **Value** |
| --- | --- | --- |
| adminUsername | Admin user for all virtual machines | Enter a Value |
| adminPassword | Admin account password | Enter a Value |
| storageAccountNamePrefix | Unique namespace for the Storage Account where the Virtual Machine&#39;s disks will be placed | Enter a Value |
| storageAccountType | Storage account type. Default Value is Standard\_LRS | Enter a Value |
| vmSize | Size of the VM&#39;s being deployed | Enter a Value |
| virtualNetworkName\_HA | The arbitrary name of the virtual network provisioned for the MongoDB deployment, HA Site | Enter a Value |
| virtualNetworkName\_DR | The arbitrary name of the virtual network provisioned for the MongoDB deployment, DR Site | Enter a Value |
| subnetName\_HA | Subnet name for the virtual network that resources will be provisioned in to, HA Site | Enter a Value |
| addressPrefix\_HA | The network address space for the virtual network, HA Site | Enter a Value |
| subnetPrefix\_HA | The network address space for the virtual subnet, HA Site | Enter a Value |
| gatewaysubnetPrefix\_HA | The network address space for the gateway subnet, HA Site | Enter a Value |
| gatewayPublicIpName\_HA | Name of public IP for gateway, HA Site | Enter a Value |
| subnetName\_DR | Subnet name for the virtual network that resources will be provisioned in to, DR Site | Enter a Value |
| addressPrefix\_DR | The network address space for the virtual network, DR Site | Enter a Value |
| subnetPrefix\_DR | The network address space for the virtual subnet, DR Site | Enter a Value |
| gatewaysubnetPrefix\_DR | The network address space for the gateway subnet, HA Site | Enter a Value |
| gatewayPublicIpName\_DR | Name of public IP for gateway, DR Site | Enter a Value |
| nodeaddressPrefix\_HA | The IP address prefix that will be used for constructing a static private IP address for each node in the deployment, HA Site | Enter a Value |
| nodeaddressPrefix\_DR | The IP address prefix that will be used for constructing a static private IP address for each node in the deployment, DR Site | Enter a Value |
| Jumpbox | The flag allowing to enable or disable provisioning of the jumpbox VM that can be used to access the MongoDB environment | Enter a Value |
| osFamily | The target OS for the virtual machines running MongoDB | Enter a Value |
| mongodbVersion | The version of the MongoDB packages to be deployed | Enter a Value |
| replicaSetName | The name of the MongoDB replica set | Enter a Value |
| replicaSetKey | The shared secret key for the MongoDB replica set | Enter a Value |
| Location | The resource group location | default value |
| Sharedkey | Secret key used for Site-to-Site connection | Enter a Value |
| gatewayname\_HA | Name of virtual network gateway, HA Site | Enter a Value |

## Deploying Script

| **Step** | **Step Details** |
| --- | --- |
| 1 | Open a PowerShell window as Administrator and navigate to the root directory and you will find Deploy-AzureResourceGroup.ps1 |
| 2 | Now run the  **Deploy-AzureResourceGroup.ps1**  , it will prompt for parameters to run |
| 3 | You will be prompted to enter Credentials. This will be the credentials for Azure Stack, Site 1(HA Site) </li>| 
| 4 | Once the HA deployments are completed, the script will disconnect from the HA Site, You will be prompted to enter Credentials for Azure Stack, Site 2(DR Site). |
| 5 | The script will continue deployment on Site 2(DR Site). |
| 6 | The script switches between HA and DR site, but it does not prompt for credentials again as it saves the context the first time, and re-uses the same when required. | 

Following is the list of parameters required by the script :
 <ul><li> AzureStackResourceGroup_HA – Name of the resource group on the HA Site where the resources will get deployed(if this resource group does not exist, the script will create it) </li>  
<li> AzureStackArmEndpoint_HA – Endpoint url of the azure stack on HA Site </li>
<li> AADTenantName_HA – AAD tenant name for the HA Site(used for authentication) </li> 
<li> AzureStackResourceGroup_DR - Name of the resource group on the DR Site where the resources will get deployed(if this resource group does not exist, the script will create it) </li>
<li> AzureStackArmEndpoint_DR – Endpoint url of the azure stack on DR Site </li>
<li> AADTenantName_DR - AAD tenant name for the DR Site(used for authentication) </li>



# Appendix

## Configuring BGP for Azure Stack Development Kit Only

| **Step** | **Step Details** |
| --- | --- |
| 1 | Log in to the Azure Stack physical host for your ASDK |
| 2 | From the Hyper-V Manager ConsoleClick Az **S-BGPNAT01** On the lower window click on Networking tabTake note of the IP address for the NAT Adapter that uses the PublicSwitch |
| 3 | Right Click Az **S-BGPNAT01**  and click  **Connect**  button |
| 4 | Sign into VM |
| 5 | Verify that IP&#39;s match by typing ipconfig /allOne of your IP addresses should match to the value from the Networking Tab in previous stepIn my environment it&#39;s  **10.16.169.131** but yours will be something different |
| 6 | In the command prompt type **Start PowerShell** And press  **Enter** |
| 7 | Enter the PowerShell commandTo designate the external NAT address for the ports that the IKE Authentication tunnel will use. Remember to change the IP Address to the value seen in **values are taken from**** Change 10.16.169.131 to your IP Address**Add-NetNatExternalAddress -NatName BGPNAT -IPAddress 10.16.169.131 -PortStart 499 -PortEnd 501Add-NetNatExternalAddress -NatName BGPNAT -IPAddress 10.16.169.131 -PortStart 1500 -PortEnd 1501 |
| 8 | Enter the PowerShell commandCreate a static NAT mapping to map the external address to the Gateway Public IP Address.This maps the ISAKMP port 500 for PHASE 1 of the IPSEC tunnel **Change 10.16.169.131 to your IP Address** Add-NetNatStaticMapping -NatName BGPNAT -Protocol UDP -ExternalIPAddress 10.16.169.131 -InternalIPAddress 192.168.102.1 -ExternalPort 500 -InternalPort 5 |
| 9 | Finally, we will need to do NAT traversal which uses port 4500 to successfully establish the complete IPSEC tunnel over NAT devices **Change 10.16.169.131 to your IP Address** Add-NetNatStaticMapping -NatName BGPNAT -Protocol UDP -ExternalIPAddress 10.16.169.131 -InternalIPAddress 192.168.102.1 -ExternalPort 4500 -InternalPort 4500 |
| 10 | If you run a Get-NetNatExternalAddress -Natname BGPNATYou should see similar resultsGet-NetNatExternalAddress -Natname BGPNAT |