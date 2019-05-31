<#
.DESCRIPTION
Deploys a MongoDB HA-DR setup on 2 azurestack sites
.EXAMPLE
.\Deploy-AzureResourceGroup.ps1 -AzureStackApplicationId <applicationid> -AzureStackApplicationSecret <applicationsecret> -AzureStackTenantId <tenantid> -AzureStackResourceGroup_HA <Ha_resourcegroupname> -AzureStackArmEndpoint_HA <Ha_armendpoint> -AzureStackSubscriptionId_HA <Ha_subscriptionid> -AzureStackResourceGroup_DR <Dr_resourcegroupname> -AzureStackArmEndpoint_DR <Dr_armendpoint> -AADTenantName_DR <Dr_tenantname>

.NOTES
.PARAMETER AzureStackApplicationId_HA
Azure Stack application ID of HA App for the Service Principal. Example: 4ca9bdf3-c205-4140-b3c3-dc4e0f1eeb86

.PARAMETER AzureStackApplicationSecret_HA
Azure Stack Application Secret of HA for the Service Principal. Example: e85cDUuLehhso2/QQF1jWu0U1th7SCFGpSotG7TVwp4=

.PARAMETER AzureStackTenantName_HA
Azure Stack Tenant Name. Example: mashybridpartner.onmicrosoft.com

.PARAMETER AzureStackResourceGroup_HA
ResourceGroup name  in HA site

.PARAMETER AzureStackArmEndpoint_HA
AzureStack Tenant Azure Resource Manager Endpoint for HA Site.  Example: https://management.westus.stackpoc.com/

.PARAMETER AzureStackSubscriptionId_HA
AzureStack Subscription Id for Creating resources. Example : 8453ce6f-76f9-44cd-b2c3-933759237bb1

.PARAMETER AzureStackApplicationId_DR
Azure Stack application ID of DR App for the Service Principal. Example: 4ca9bdf3-c205-4140-b3c3-dc4e0f1eeb86

.PARAMETER AzureStackApplicationSecret_DR
Azure Stack Application Secret of DR App for the Service Principal. Example: e85cDUuLehhso2/QQF1jWu0U1th7SCFGpSotG7TVwp4=

.PARAMETER AzureStackResourceGroup_DR
ResourceGroup name  in DR site

.PARAMETER AADTenantName_DR
Azure Stack Tenant Name in DR Site. Example : mashybridpartner.onmicrosoft.com

.PARAMETER AzureStackArmEndpoint_DR
AzureStack Tenant Azure Resource Manager Endpoint for DR Site.  Example: https://management.westus2.stackpoc.com/

.PARAMETER AzureStackSubscriptionId_DR
AzureStack Subscription Id for Creating resources. Example : fdb3381c-5fc1-4cfc-acd1-1240c51d2443

.SYNOPSIS
Deploys the MongoDB HA and DR  into Two AzureStack environments.
#>

[CmdletBinding()]
Param(
    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationId_HA, 
    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationSecret_HA, 
    [Parameter(Mandatory = $true)][System.String]$AADTenantName_HA  ,
    [Parameter(Mandatory = $true)][System.String]$AzureStackResourceGroup_HA,
    [Parameter(Mandatory = $true)][System.String]$AzureStackArmEndpoint_HA ,
    [Parameter(Mandatory = $true)][System.String]$AzureStackSubscriptionId_HA , 
    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationId_DR, 
    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationSecret_DR,
    [Parameter(Mandatory = $true)][System.String]$AzureStackResourceGroup_DR,
    [Parameter(Mandatory = $true)][System.String]$AADTenantName_DR, 
    [Parameter(Mandatory = $true)][System.String]$AzureStackArmEndpoint_DR ,
    [Parameter(Mandatory = $true)][System.String]$AzureStackSubscriptionId_DR        
) 

$ErrorActionPreference = 'Stop' 

# Set the PowerShell Repository
Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted

#region Install Package Manager
Find-PackageProvider -Name 'Nuget' -ForceBootstrap -IncludeDependencies -Force

Import-Module -Name PowerShellGet -ErrorAction Stop
Import-Module -Name PackageManagement -ErrorAction Stop
Get-PSRepository -Name "PSGallery"
#endregion

# Load all modules of AzureRM
Install-Module AzureRM -RequiredVersion 2.3.0 -Force  
Import-Module AzureRM

# Load all modules of AzureRM.Profile
Import-Module AzureRM.Profile

#region Load AzureRM Module
#Install the AzureRM.Bootstrapper module. Select Yes when prompted to install NuGet
Install-Module -Name AzureRm.BootStrapper

# Install and import the API Version Profile required by Azure Stack into the current PowerShell session.
if ((Get-AzureRmProfile).ProfileName -ne '2018-03-01-hybrid') {
    Install-AzureRmProfile -Profile 2018-03-01-hybrid
}

Use-AzureRmProfile -Profile 2018-03-01-hybrid -Force

Install-Module -Name AzureStack -RequiredVersion 1.7.0 -AllowClobber
#endregion
#>
#Set-Location   "D:\SQL HA &DR PROJECT\WORKED SQL HADR"

Import-Module .\LoginModule.psm1

Write-Host "****************************************"
Write-Host "Finished downloading dependent modules."
Write-Host "****************************************"


#### HA Deployment ####
$region_HA = $AzureStackArmEndpoint_HA.Split('.')[1]
$azureStackTemplateLocation_HA = (Get-Item .\HA\azurestackdeploy1.json).FullName
$azureStackParamLocation_HA = (Get-Item .\HA\azurestackdeploy1.parameters.json).FullName
$azureStackTemplateLocation_DR1 = (Get-Item .\DR\azurestackdeployDRPart1.json).FullName
$azureStackParamLocation_DR1 = (Get-Item .\DR\azurestackdeployDRPart1.parameters.json).FullName
$azureStackTemplateLocation_DR2 = (Get-Item .\DR\azurestackdeployDRPart2.json).FullName
$azureStackParamLocation_DR2 = (Get-Item .\DR\azurestackdeployDRPart2.parameters.json).FullName
$azureStackTemplateLocation_cluster = (Get-Item .\HA\azurestackdeploy2.json).FullName
$azureStackParamLocation_cluster = (Get-Item .\HA\azurestackdeploy2.parameters.json).FullName

#region login to HA  and checking if resource group is available 
$loginInfo_HA = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_HA -AADTenantName $AADTenantName_HA -AzureStackSubscriptionId $AzureStackSubscriptionId_HA -AzureStackApplicationId $AzureStackApplicationId_HA -AzureStackApplicationSecret $AzureStackApplicationSecret_HA -EnvironmentName "AzureStack_HA"

$newAzureResourceGroup_HA = Get-AzureRmResourceGroup | Where-Object ResourceGroupName -EQ $AzureStackResourceGroup_HA

if (!$newAzureResourceGroup_HA) {
    Write-Host "Creating resource group $AzureStackResourceGroup_HA in $region_HA region" 
    New-AzureRmResourceGroup -Name $AzureStackResourceGroup_HA -Location $region_HA | Out-Null
    $newAzureResourceGroup_HA = $null

    while (!$newAzureResourceGroup_HA) {
        $newAzureResourceGroup_HA = Get-AzureRmResourceGroup -Name $AzureStackResourceGroup_HA
        Start-Sleep -Seconds 1
    }
}
else {
    Write-Host "Resource Group $AzureStackResourceGroup_HA Already exists moving to next step......"  
}

#region, programatically add linked templates and scripts to storage account
# --------------------------
# --- Upload Image Files ---
# --------------------------
[int]$counter = 1
$storageAccountName = "sqlstorageimage$counter"
$counter++
$storageContainerName = 'sqltemplates'

#region Creates a Storage Account in Azure if one exists skips to next step
$azureStorageAcc = Get-AzureRmStorageAccount | Where-Object StorageAccountName -EQ $storageAccountName
while ($azureStorageAcc) {
    $storageAccountName = "sqlstorageimage$counter"
	$counter++
    Write-Host "Storage Account exists, trying '$storageAccountName'"
    $azureStorageAcc = Get-AzureRmStorageAccount | Where-Object StorageAccountName -EQ $storageAccountName
}

Write-Host "Creating Storage Account '$storageAccountName'" 
New-AzureRmStorageAccount -ResourceGroupName $AzureStackResourceGroup_HA -Name $storageAccountName -Location $newAzureResourceGroup_HA.Location -SkuName Standard_LRS

# Wait for the storage account to be created
$azureStorageAcc = Get-AzureRmStorageAccount | Where-Object StorageAccountName -EQ $storageAccountName

while (!$azureStorageAcc) {
    Start-Sleep -Seconds 2
    $azureStorageAcc = Get-AzureRmStorageAccount | Where-Object StorageAccountName -EQ $storageAccountName
}
#endregion

#region Creates a Storage Container if it exists skips to next step
$storageContainer = Get-AzureStorageContainer -Context $azureStorageAcc.Context | Where-Object { $_.Name -eq $storageContainerName }

if ($storageContainer) {
    Write-Host "Storage Container $storageContainer already exists moving to next step..."
}
else {
    $storageContainer = New-AzureStorageContainer -Name $storageContainerName -Context $azureStorageAcc.Context -Permission Container
}

$containerUrl = "$($storageContainer.Context.BlobEndPoint)$storageContainerName"
#endregion

#region Upload Image Files to the container
cd .\HA
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeploy1.json" -Blob "azurestackdeploy1.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeploy1.parameters.json" -Blob "azurestackdeploy1.parameters.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeploy2.json" -Blob "azurestackdeploy2.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeploy2.parameters.json" -Blob "azurestackdeploy2.parameters.json" -Context $storageContainer.Context
cd .\nested
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\configuringAlwaysOn.json" -Blob "configuringAlwaysOn.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\creatingADNIC.json" -Blob "creatingADNIC.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\creatingNICS.json" -Blob "creatingNICS.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\preparingSqlServer.json" -Blob "preparingSqlServer.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\provisioningADVM.json" -Blob "provisioningADVM.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\provisioningSQLVMs.json" -Blob "provisioningSQLVMs.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\setupLBs-e.json" -Blob "setupLBs-e.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\Site2SiteVpnHa.json" -Blob "Site2SiteVpnHa.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\storageAccountVirtualNetworkPublicIP.json" -Blob "storageAccountVirtualNetworkPublicIP.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\vnet-with-dns-server.json" -Blob "vnet-with-dns-server.json" -Context $storageContainer.Context
cd ..\scripts
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\CreateADPDC.ps1.zip" -Blob "CreateADPDC.ps1.zip" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\CreateFailoverCluster.ps1.zip" -Blob "CreateFailoverCluster.ps1.zip" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\CreateFileShareWitness.ps1.zip" -Blob "CreateFileShareWitness.ps1.zip" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\PrepareAlwaysOnSqlServer.ps1.zip" -Blob "PrepareAlwaysOnSqlServer.ps1.zip" -Context $storageContainer.Context
cd ..\..\DR
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeployDRPart1.json" -Blob "azurestackdeployDRPart1.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeployDRPart1.parameters.json" -Blob "azurestackdeployDRPart1.parameters.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeployDRPart2.json" -Blob "azurestackdeployDRPart2.json" -Context $storageContainer.Context
Set-AzureStorageBlobContent -Container $storageContainer.Name -File ".\azurestackdeployDRPart2.parameters.json" -Blob "azurestackdeployDRPart2.parameters.json" -Context $storageContainer.Context

cd ..
#endregion

Write-Host "started overwriting artifacts location in ARM templates"

#region Update the storage URLs in the template files
# Update the templates with the storage URL
$templateContent = (Get-Content -Path (Get-Item '.\DR\azurestackdeployDRPart2.txt').FullName).Replace('{{StorageUrl}}', $containerUrl)
$templateContent | Set-Content -Path '.\DR\azurestackdeployDRPart2.json'
$templateContent = (Get-Content -Path (Get-Item '.\HA\azurestackdeploy1.txt').FullName).Replace('{{StorageUrl}}', $containerUrl)
$templateContent | Set-Content -Path '.\HA\azurestackdeploy1.json'
$templateContent = (Get-Content -Path (Get-Item '.\HA\azurestackdeploy2.txt').FullName).Replace('{{StorageUrl}}', $containerUrl)
$templateContent | Set-Content -Path '.\HA\azurestackdeploy2.json'

Write-Host "completed overwriting artifacts location in ARM templates"
#endregion
#end region, programatically add linked templates and scripts to storage account


#region Deploy Sql HA(with local gateway and s2s connection) 
Write-Host "****************************************"
Write-Host "Starting AzureStack HA Deployment."
Write-Host "****************************************"

$Output_SqlHA = New-AzureRmResourceGroupDeployment -Name "AzureStack-HA-Deployment" -ResourceGroupName $AzureStackResourceGroup_HA -TemplateFile $azureStackTemplateLocation_HA -TemplateParameterFile $azureStackParamLocation_HA -Mode Incremental

Write-Host "***************************************************"
Write-Host "AzureStack HA Deployment is done."
Write-Host "Reading output values from HA Deployment........."
Write-Host "***************************************************"

#region read output values from SqlHA deployment
$domainName = $Output_SqlHA.Outputs.item("domainname").value
$localgatewayName_HA = $Output_SqlHA.Outputs.item("localgatewayname").value
Get-AzureRmLocalNetworkGateway -Name $localgatewayName_HA -ResourceGroupName $AzureStackResourceGroup_HA
$gatewaypublicipname_HA = $Output_SqlHA.Outputs.item("gatewayPublicIPName").value
$GatewaypublicIPAddress_HA = Get-AzureRmPublicIpAddress -Name $gatewaypublicipname_HA -ResourceGroupName $AzureStackResourceGroup_HA
$GatewaypublicIPAddress_HA = $GatewaypublicIPAddress_HA.IpAddress
$VnetAddressSpace_HA1 = Get-AzureRmVirtualNetwork -ResourceGroupName $AzureStackResourceGroup_HA 
$VnetAddressSpace_HA = $VnetAddressSpace_HA1.AddressSpace.AddressPrefixes
$SharedKey_HA = $Output_SqlHA.Outputs.item("sharedKey").value
$virtualNetworkAddressRange = $Output_SqlHA.Outputs.item("virtualNetworkAddressRange").value
$connectionName_HA = $Output_SqlHA.Outputs.item("connectionName").value
$localgatewayName_HA = $Output_SqlHA.Outputs.item("localgatewayname").value
$sqlVMName_HA = $Output_SqlHA.Outputs.item("sqlVMName").value  #Sql VM in HA Site where the windows cluster is created
$adminUsername = $Output_SqlHA.Outputs.item("domainusername").value
$adminPassword = $Output_SqlHA.Outputs.item("domainpassword").value
$sqlAOEPName = $Output_SqlHA.Outputs.item("sqlAOEPName").value
$sqlServerServiceAccountUserName = $Output_SqlHA.Outputs.item("sqlServerServiceAccountUserName").value
$sqlServerServiceAccountPassword = $Output_SqlHA.Outputs.item("sqlServerServiceAccountPassword").value
$clusterName = $Output_SqlHA.Outputs.item("clustername").value
$sharePath = $Output_SqlHA.Outputs.item("sharePath").value
$sqlAOAGName = $Output_SqlHA.Outputs.item("sqlAOAGName").value
$sqlAOListenerName = $Output_SqlHA.Outputs.item("sqlAOListenerName").value
$sqlAOListenerPort = $Output_SqlHA.Outputs.item("sqlAOListenerPort").value
$sqlLBIPName = $Output_SqlHA.Outputs.item("sqlpublicip").value
$sqlLBName = $Output_SqlHA.Outputs.item("sqlLBName").value
$numberOfDataDisks = $Output_SqlHA.Outputs.item("noofDisks").value
$sqlLBIPaddressinfo = Get-AzureRmPublicIpAddress -Name $sqlLBIPName -ResourceGroupName $AzureStackResourceGroup_HA
$sqlLBIPAddress = $sqlLBIPaddressinfo.IpAddress
$adPDCVMName = $Output_SqlHA.Outputs.item("adPDCVMName").value
$sqlwVMName = $Output_SqlHA.Outputs.item("sqlwVMName").value
$databaseName = $Output_SqlHA.Outputs.item("sampleDatabaseName").value
$Dnsserveraddress = $Output_SqlHA.Outputs.item("dnsServerAddress").value
$deploymentPrefix = $Output_SqlHA.Outputs.item("deploymentPrefix").value

Logout-AzureRmAccount

Write-Host "*********************************"
Write-Host "Changing context to DR environment."
Write-Host "*********************************"

#removing HA environment 
Remove-AzureRmEnvironment -Name "AzureStack_HA"

#region DR networking components deployment
$region_DR = $AzureStackArmEndpoint_DR.Split('.')[1]

#region login into DR and checking if resource group is available
$loginInfo_DR = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_DR -AADTenantName $AADTenantName_DR -AzureStackSubscriptionId $AzureStackSubscriptionId_DR -AzureStackApplicationId $AzureStackApplicationId_DR -AzureStackApplicationSecret $AzureStackApplicationSecret_DR -EnvironmentName "AzureStack_DR"

$newAzureResourceGroup_DR = Get-AzureRmResourceGroup | Where-Object ResourceGroupName -EQ $AzureStackResourceGroup_DR

if (!$newAzureResourceGroup_DR) {
    New-AzureRmResourceGroup -Name $AzureStackResourceGroup_DR -Location $region_DR | Out-Null
    $newAzureResourceGroup_DR = $null

    while (!$newAzureResourceGroup_DR) {
        $newAzureResourceGroup_DR = Get-AzureRmResourceGroup -Name $AzureStackResourceGroup_DR
        Start-Sleep -Seconds 1
    }
}
else {
    Write-Host "Resource Group $AzureStackResourceGroup_DR Already exists moving to next step......"  
}

Write-Host "****************************************"
Write-Host "Starting AzureStack DR part1 Deployment."
Write-Host "****************************************"

$Output_SqlDR1 = New-AzureRmResourceGroupDeployment `
    -Name "AzureStack-DR-part1" `
    -ResourceGroupName $AzureStackResourceGroup_DR `
    -TemplateFile $azureStackTemplateLocation_DR1 `
    -TemplateParameterFile $azureStackParamLocation_DR1 `
    -DNSServerAddress $Dnsserveraddress `
    -sharedKey $SharedKey_HA `
    -Mode Incremental

Write-Host "****************************************"
Write-Host "AzureStack DR part1 Deployment is done."
Write-Host "****************************************"
#end region

#region read output values from 1st DR template deployment
[object]$vNetAddressSpace_DR = $Output_SqlDR1.Outputs.item("vnetAddressSpace").value
$sharedKey = $Output_SqlDR1.Outputs.item("sharedKey").value
$subnetName = $Output_SqlDR1.Outputs.Item("subnetName").value
$virtualNetworkName = $Output_SqlDR1.Outputs.Item("virtualnetworkname").value
$gatewayPublicIPName = $Output_SqlDR1.Outputs.item("gatewayPublicIPName").value

$vmusername_DR = $Output_SqlDR1.Outputs.Item("vmusername").value
$vmpassword_DR = $Output_SqlDR1.Outputs.Item("vmpassword").value
$sqlVmSize = $Output_SqlDR1.Outputs.Item("sqlVMSize").value
$vmDiskSize = $Output_SqlDR1.Outputs.Item("vmDiskSize").value
$vmname = $Output_SqlDR1.Outputs.Item("vmname").value
$gateway1 = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_DR
$gatewayName = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_DR -Name $gateway1.Name

#region create local network gateway and connection on the DR site 
#local nw gateway should take address space and ip address based on HA deployment
$localGW_DR = New-AzureRmLocalNetworkGateway -Name LocalGWDR -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR -GatewayIpAddress $GatewaypublicIPAddress_HA -AddressPrefix $VnetAddressSpace_HA -force
New-AzureRmVirtualNetworkGatewayConnection -Name AzureStackConnDRtoHA -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR -VirtualNetworkGateway1 $gatewayName -LocalNetworkGateway2 $localGW_DR -ConnectionType IPsec -RoutingWeight 10 -SharedKey $sharedKey -force

$GatewaypublicIPAddress_DR = Get-AzureRmPublicIpAddress -Name $gatewayPublicIPName -ResourceGroupName $AzureStackResourceGroup_DR
$GatewaypublicIPAddress_DR = $GatewaypublicIPAddress_DR.IpAddress

Logout-AzureRmAccount
#end region

#region creation of new local gateway and connection  && deletion of temp local gateway /connection  on the HA site
#Connection to HA Site
Write-Host "****************************************"
Write-Host "Creation of connection on both Sites."
Write-Host "****************************************"

Remove-AzureRmEnvironment -Name "AzureStack_DR"

$loginInfo_HA = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_HA -AADTenantName $AADTenantName_HA -AzureStackSubscriptionId $AzureStackSubscriptionId_HA -AzureStackApplicationId $AzureStackApplicationId_HA -AzureStackApplicationSecret $AzureStackApplicationSecret_HA -EnvironmentName "AzureStack_HA"

$localGW_HA = New-AzureRmLocalNetworkGateway -Name LocalGWHA -ResourceGroupName $AzureStackResourceGroup_HA -Location $region_HA -GatewayIpAddress $GatewaypublicIPAddress_DR -AddressPrefix $vNetAddressSpace_DR -Force
$gateway1 = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_HA
$gatewayName = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_HA -Name $gateway1.Name
New-AzureRmVirtualNetworkGatewayConnection -Name AzureStackConnHAtoDR -ResourceGroupName $AzureStackResourceGroup_HA -Location $region_HA -VirtualNetworkGateway1 $gatewayName -LocalNetworkGateway2 $localGW_HA -ConnectionType IPsec -RoutingWeight 10 -SharedKey $sharedKey -Force
Remove-AzureRmVirtualNetworkGatewayConnection -Name $connectionName_HA -ResourceGroupName $AzureStackResourceGroup_HA -Force
Remove-AzureRmLocalNetworkGateway -Name $localgatewayName_HA -ResourceGroupName $AzureStackResourceGroup_HA -Force

Logout-AzureRmAccount

Write-Host "****************************************"
Write-Host "S2S connection established on both Sites."
Write-Host "****************************************"

#Connection to HA Site 
Remove-AzureRmEnvironment -Name "AzureStack_HA"

$loginInfo_DR = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_DR -AADTenantName $AADTenantName_DR -AzureStackSubscriptionId $AzureStackSubscriptionId_DR -AzureStackApplicationId $AzureStackApplicationId_DR -AzureStackApplicationSecret $AzureStackApplicationSecret_DR -EnvironmentName "AzureStack_DR"

Write-Host "****************************************"
Write-Host "Starting DR Part2 deployment."
Write-Host "****************************************"

$Output_SqlDR2 = New-AzureRmResourceGroupDeployment `
    -TemplateFile $azureStackTemplateLocation_DR2 `
    -TemplateParameterFile $azureStackParamLocation_DR2 `
    -sqlvmname $vmname `
    -adminUsername $adminUsername `
    -adminPassword $adminPassword `
    -subnetName $subnetName `
    -domainUsername $adminUsername `
    -domainPassword $adminPassword `
    -sqlAOEPName $sqlAOEPName `
    -sqlServerServiceAccountUserName $sqlServerServiceAccountUserName `
    -sqlServerServiceAccountPassword $sqlServerServiceAccountPassword `
    -virtualNetworkName $virtualNetworkName `
    -sqlVMSize $sqlVmSize `
    -domaintoJoin $domainName `
    -vmDiskSize $vmDiskSize `
	-Mode Incremental `
    -ResourceGroupName $AzureStackResourceGroup_DR

Write-Host "****************************************"
Write-Host "DR Part2 deployment completed."
Write-Host "****************************************"

$DRSqlVmName = $Output_SqlDR2.Outputs.item("sqlvmname").value  #get this value after DR deployment
$DRLBIPName = $Output_SqlDR2.Outputs.item("drlbipName").value
$DRLBIPaddressinfo = Get-AzureRmPublicIpAddress -Name $DRLBIPName -ResourceGroupName $AzureStackResourceGroup_DR
$DRLBIPAddress = $DRLBIPaddressinfo.IpAddress

Logout-AzureRmAccount
#endregion

Remove-AzureRmEnvironment -Name "AzureStack_DR"

$loginInfo_HA = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_HA -AADTenantName $AADTenantName_HA -AzureStackSubscriptionId $AzureStackSubscriptionId_HA -AzureStackApplicationId $AzureStackApplicationId_HA -AzureStackApplicationSecret $AzureStackApplicationSecret_HA -EnvironmentName "AzureStack_HA"

Write-Host "****************************************"
Write-Host "Configuring Always on for HA and DR."
Write-Host "****************************************"

New-AzureRmResourceGroupDeployment `
     -Name "Configure-alwayson" `
    -TemplateFile $azureStackTemplateLocation_cluster `
    -TemplateParameterFile $azureStackParamLocation_cluster `
    -sqlVMName $sqlVMName_HA `
    -drvmname $DRSqlVmName `
    -adminUsername $adminUsername `
    -adminPassword $adminPassword `
    -domainName $domainName `
    -deploymentPrefix $deploymentPrefix `
    -sqlServerServiceAccountUserName $sqlServerServiceAccountUserName `
    -sqlServerServiceAccountPassword $sqlServerServiceAccountPassword `
    -sqlAOAGName $sqlAOAGName `
    -sqlAOListenerName $sqlAOListenerName `
    -sqlAOListenerPort $sqlAOListenerPort `
    -sqlLBName $sqlLBName `
    -sqlLBIPAddress $sqlLBIPAddress `
    -DRLBIPAddress $DRLBIPAddress `
    -adPDCVMName $adPDCVMName `
    -sqlwVMName $sqlwVMName `
    -numberOfSqlVMDisks $numberOfDataDisks `
    -sampleDatabaseName $databaseName `
    -Mode Incremental `
    -ResourceGroupName $AzureStackResourceGroup_HA

Logout-AzureRmAccount

Write-Host "****************************************"
Write-Host "Azure Stack SQL HADR Deployment is Done."
Write-Host "****************************************"
    