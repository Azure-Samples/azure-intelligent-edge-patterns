<#
.DESCRIPTION
Deploys a MongoDB HA-DR setup on 2 azurestack sites

.NOTES
Additional optional notes can go here. You could make a note of any prerequisites, conditions, etc.
For example. To make test.json you can use this command.
Get-ChildItem  | ConvertTo-Json | Out-File .\test.json
The order on which the items appear should not matter.
For more information you can use => Get-help about_comment_based_help

.PARAMETER Path
Path to the JSON file to read. Be sure to include a .PARAMETER entry for each Parameter.

.SYNOPSIS
Reads in a JSON list of files.
#>
[CmdletBinding()]
Param(

      [Parameter(Mandatory=$true)][System.String]$AzureStackResourceGroup_HA,

      [Parameter(Mandatory=$true)][System.String]$AzureStackArmEndpoint_HA , # "https://management.westus.stackpoc.com"

      [Parameter(Mandatory=$true)][System.String]$AADTenantName_HA , # "mashybridpartner.onmicrosoft.com"
      
      [Parameter(Mandatory=$true)][System.String]$AzureStackResourceGroup_DR,

      [Parameter(Mandatory=$true)][System.String]$AzureStackArmEndpoint_DR , # "https://management.westus2.stackpoc.com"

      [Parameter(Mandatory=$true)][System.String]$AADTenantName_DR  # "mashybridpartner.onmicrosoft.com"        
      
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
Install-Module AzureRM -RequiredVersion 2.3.0
Import-Module AzureRM

# Load all modules of AzureRM.Profile
# Install-Module AzureRM.Profile -RequiredVersion 5.8.2
Import-Module AzureRM.Profile

#region Load AzureRM Module
# Install the AzureRM.Bootstrapper module. Select Yes when prompted to install NuGet
Install-Module -Name AzureRm.BootStrapper

# Install and import the API Version Profile required by Azure Stack into the current PowerShell session.
if ((Get-AzureRmProfile).ProfileName -ne '2018-03-01-hybrid') {
    Install-AzureRmProfile -Profile 2018-03-01-hybrid
}

Use-AzureRmProfile -Profile 2018-03-01-hybrid -Force

Install-Module -Name AzureStack -RequiredVersion 1.7.0 -AllowClobber
Install-Module AzureRm.ApplicationInsights -AllowClobber
#endregion

Import-Module .\AzureTool.psm1

# --------------------------------------
# --- AzureStack HA Site Deployment ---
# --------------------------------------


#region AddingHAENV

# Register an Azure Resource Manager environment that targets your Azure Stack HA instance. Get your Azure Resource Manager endpoint value from your service provider.
Add-AzureRMEnvironment -Name "AzureStack_HA" -ArmEndpoint $AzureStackArmEndpoint_HA 

     #Set your tenant name
$AuthEndpoint = (Get-AzureRmEnvironment -Name "AzureStack_HA").ActiveDirectoryAuthority.TrimEnd('/')
$AADTenantName = $AADTenantName_HA
$TenantId = (invoke-restmethod "$($AuthEndpoint)/$($AADTenantName)/.well-known/openid-configuration").issuer.TrimEnd('/').Split('/')[-1]

    # After signing in to your environment, Azure Stack cmdlets
    # can be easily targeted at your Azure Stack instance.
Add-AzureRmAccount -EnvironmentName "AzureStack_HA" -TenantId $TenantId
    

    #logic to extract region from ARM endpoint
$idx1 = $AzureStackArmEndpoint_HA.IndexOf(".")
$substring1 = $AzureStackArmEndpoint_HA.Substring($idx1+1)
$idx2 = $substring1.IndexOf(".")

$region_HA = $substring1.Substring(0,$idx2)
Write-Host $region_HA

#endregion

#region Getting the filepaths

#template locations of Mongo-HA DR TemplateFile
$azureStackTemplateLocation_HA = (Get-Item .\MongoHA\AzureDeployHA.json).FullName
$azureStackTemplateLocation_HA_part2 = (Get-Item .\MongoHA\MongoHANet.json).FullName
$azureStackParamLocation =(Get-Item .\azurestackdeploy.parameters.json).FullName
$azureStackTemplateLocation_DR_part2 = (Get-Item .\MongoDR\AzureDeployDR.json).FullName


#endregion

#region Gets Subscription if only one subscription it selects if multiple subscriptions prompts you to chose
$subscription_HA = Select-Item -Choices (Get-AzureRmSubscription) -Description Environment -Display Name
Set-AzureRmContext -SubscriptionId $subscription_HA.Id
#region creating HA context file
$Curr_Dir =  Get-Location
$FileName_HA_Context = "\HAContext.json"

Save-AzureRmContext -Path $Curr_Dir$FileName_HA_Context -Force
#endregion



#region Creating resourcegroup
#Creating a ResourceGroup in westus Location for MongoHA
$newAzureResourceGroup_HA = Get-AzureRmResourceGroup | Where-Object ResourceGroupName -EQ $AzureStackResourceGroup_HA

if (!$newAzureResourceGroup_HA) 
{
    Write-Host "Creating resource group $AzureStackResourceGroup_HA in $region_HA region" 
    New-AzureRmResourceGroup -Name $AzureStackResourceGroup_HA -Location $region_HA | Out-Null
    $newAzureResourceGroup_HA = $null
    while (!$newAzureResourceGroup_HA) 
    {
        $newAzureResourceGroup_HA = Get-AzureRmResourceGroup -Name $AzureStackResourceGroup_HA
        Start-Sleep -Seconds 1
    }

}
else 
{
    Write-Host "Resource Group $AzureStackResourceGroup_HA Already exists moving to next step......"  
}
#endregion


function GetNicIPHA($a)
{
    $Op = $a
    $ul = $Op.IndexOf("privateIPAddress")
    $ll = $op.IndexOf("privateIPAllocationMethod")
    $op1= $Op.Substring($ul,$ll)
    $op1 = $op1.split(":")[1]
    $privateip =$op1.split(",")[0]
    $privateip=$privateip -replace '["",   ]'
    return $privateip
}

#region HA Deployment
$hadep = New-AzureRmResourceGroupDeployment -Name "AzureStack-HA-Deployment" -ResourceGroupName $AzureStackResourceGroup_HA -TemplateFile $azureStackTemplateLocation_HA -TemplateParameterFile $azureStackParamLocation -location $region_HA -Mode Incremental 
Write-Host "Mongo HA Networking part deployement started"
#$rg=Get-AzureRmPublicIpAddress -Name azureGatewayIP -ResourceGroupName 
$vm=New-AzureRmResourceGroupDeployment -Name "AzureStack-HA-Deployment" -ResourceGroupName $AzureStackResourceGroup_HA -TemplateFile $azureStackTemplateLocation_HA_part2 -TemplateParameterFile $azureStackParamLocation  -Mode Incremental
$privateIP=Get-AzureRmNetworkInterface -Name nicMember1 -ResourceGroupName $AzureStackResourceGroup_HA
$privateIP =$privateIP.IpConfigurations.PrivateIpAddress
Write-Host $privateip
$gatewaypublicipname_HA = $vm.Outputs.gatewayPublicIpName_HA.Value
$GatewaypublicIPAddress_HA = Get-AzureRmPublicIpAddress -Name $gatewaypublicipname_HA -ResourceGroupName $AzureStackResourceGroup_HA
$GatewaypublicIPAddress_HA = $GatewaypublicIPAddress_HA.IpAddress
$sharedKey = $vm.Outputs.sharedKey.value
$subnetPrefix_DR = $vm.Outputs.subnetPrefix_DR.Value
$gatewaysubnetPrefix_DR = $vm.Outputs.gatewaysubnetPrefix_DR.Value
$addressPrefix_DR = $vm.Outputs.addressPrefix_DR.Value
$gatewaypublicipname_DR = $vm.Outputs.gatewayPublicIpName_DR.Value
#$VnetAddressSpace_HA = $vm.Outputs.item("vnetAddressSpace").value
$vnetgw_HA = $vm.Outputs.vnetgw.Value
$connectionName =$vm.Outputs.connectionName.value
$VnetAddressSpace_HA = Get-AzureRmVirtualNetwork -ResourceGroupName $AzureStackResourceGroup_HA 
$VnetAddressSpace_HA = $VnetAddressSpace_HA.AddressSpace.AddressPrefixes
$virtualNetworkName_DR = $vm.Outputs.virtualNetworkName_DR.Value
#Displaying outputs from the MongoHA Deployment
Write-Host $gatewaypublicipname_HA
Write-Host $GatewaypublicIPAddress_HA
Write-Host $sharedKey
Write-Host $VnetAddressSpace_HA
Write-Host $vnetgw_HA

Read-Host "AzureStack HA Deployment is done... Press any key to continue"

Clear-AzureRmContext -Force


#endregion

# --------------------------------------
# --- AzureStack DR Site Deployment ---
# --------------------------------------

#region AddingDRENV
Add-AzureRmEnvironment -Name "AzureStack_DR" -ARMEndpoint $AzureStackArmEndpoint_DR
$AuthEndpoint = (Get-AzureRmEnvironment -Name "AzureStack_DR").ActiveDirectoryAuthority.TrimEnd('/')
$AADTenantName = $AADTenantName_DR
$TenantId = (invoke-restmethod "$($AuthEndpoint)/$($AADTenantName)/.well-known/openid-configuration").issuer.TrimEnd('/').Split('/')[-1]
Add-AzureRmAccount -EnvironmentName "AzureStack_Dr" -TenantId $TenantId
$idx1 = $AzureStackArmEndpoint_DR.IndexOf(".")
$substring1 = $AzureStackArmEndpoint_DR.Substring($idx1+1)
$idx2 = $substring1.IndexOf(".")
$region_DR = $substring1.Substring(0,$idx2)
Write-Host $region_Dr
#endregion

#region Gets Subscription if only one subscription it selects if multiple subscriptions prompts you to chose
$subscriptions_DR = Select-Item -Choices (Get-AzureRmSubscription) -Description Environment -Display Name

#region Creating DR context
Set-AzureRmContext -SubscriptionId $subscriptions_DR.Id
$Curr_Dir =  Get-Location
$FileName_DR_Context = "\DRContext.json"

Save-AzureRmContext -Path $Curr_Dir$FileName_DR_Context -Force

#endregion

#region Creating resourcegroup
$newAzureResourceGroup_DR = Get-AzureRmResourceGroup | Where-Object ResourceGroupName -EQ $AzureStackResourceGroup_DR

if (!$newAzureResourceGroup_DR) 
{
    Write-Host "Creating resource group $AzureStackResourceGroup_DR in $region_DR region" 
    New-AzureRmResourceGroup -Name $AzureStackResourceGroup_DR -Location $region_DR | Out-Null
    $newAzureResourceGroup_DR = $null
    while (!$newAzureResourceGroup_DR) 
    {
        $newAzureResourceGroup_DR = Get-AzureRmResourceGroup -Name $AzureStackResourceGroup_DR
        Start-Sleep -Seconds 1
    }
}
else 
{
    Write-Host "Resource Group $AzureStackResourceGroup_DR Already exists moving to next step......"  
}
#endregion

#region DR Deployment
Write-Host "Mongo DR Networking part deployement started"


$sub = @((New-AzureRmVirtualNetworkSubnetConfig -AddressPrefix $gatewaysubnetPrefix_DR -Name GatewaySubnet),
         (New-AzureRmVirtualNetworkSubnetConfig -AddressPrefix $subnetPrefix_DR -Name Default))
$vnet =  New-AzureRmVirtualNetwork -Name $virtualNetworkName_DR -AddressPrefix $addressPrefix_DR -Subnet $sub -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR
$vNetAddressSpace_DR = $vnet.AddressSpace.AddressPrefixes
$localGW_DR =New-AzureRmLocalNetworkGateway -Name LocalGWDR -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR -GatewayIpAddress $GatewaypublicIPAddress_HA -AddressPrefix $VnetAddressSpace_HA


$gwpip    = New-AzureRmPublicIpAddress -Name $gatewaypublicipname_DR -ResourceGroupName $AzureStackResourceGroup_DR `
              -Location $region_DR -AllocationMethod Dynamic
$subnet   = Get-AzureRmVirtualNetworkSubnetConfig -Name 'GatewaySubnet' `
              -VirtualNetwork $vnet
$gwipconf = New-AzureRmVirtualNetworkGatewayIpConfig -Name 'ipconfig' `
              -Subnet $subnet -PublicIpAddress $gwpip
New-AzureRmVirtualNetworkGateway -Name Vng_DR -ResourceGroupName $AzureStackResourceGroup_DR `
  -Location $region_DR -IpConfigurations $gwipconf -GatewayType Vpn `
  -VpnType RouteBased -GatewaySku VpnGw1 -force
  $localGW_DR =New-AzureRmLocalNetworkGateway -Name LocalGWDR -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR -GatewayIpAddress $GatewaypublicIPAddress_HA -AddressPrefix $VnetAddressSpace_HA -force
$gateway1 = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_DR
$gatewayName = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_DR -Name $gateway1.Name
New-AzureRmVirtualNetworkGatewayConnection -Name $connectionName -ResourceGroupName $AzureStackResourceGroup_DR -Location $region_DR -VirtualNetworkGateway1 $gatewayName -LocalNetworkGateway2 $localGW_DR -ConnectionType IPsec -RoutingWeight 10 -SharedKey $sharedKey -force

$GatewaypublicIPAddress_DR = Get-AzureRmPublicIpAddress -Name $gatewaypublicipname_DR -ResourceGroupName $AzureStackResourceGroup_DR
$GatewaypublicIPAddress_DR = $GatewaypublicIPAddress_DR.IpAddress

 
  


Clear-AzureRmContext -Force

#Connection to HA Site 
Import-AzureRmContext -Path $Curr_Dir$FileName_HA_Context
$localGW_HA =New-AzureRmLocalNetworkGateway -Name LocalGWHA -ResourceGroupName $AzureStackResourceGroup_HA -Location $region_HA -GatewayIpAddress $GatewaypublicIPAddress_DR -AddressPrefix $vNetAddressSpace_DR
$gateway1 = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_HA
$gatewayName = Get-AzureRmVirtualNetworkGateway -ResourceGroupName $AzureStackResourceGroup_HA -Name $gateway1.Name
New-AzureRmVirtualNetworkGatewayConnection -Name $connectionName -ResourceGroupName $AzureStackResourceGroup_HA -Location $region_HA -VirtualNetworkGateway1 $gatewayName -LocalNetworkGateway2 $localGW_HA -ConnectionType IPsec -RoutingWeight 10 -SharedKey $sharedKey

 Remove-AzureRmVirtualNetworkGatewayConnection -Name TempConn -ResourceGroupName $AzureStackResourceGroup_HA
Remove-AzureRmLocalNetworkGateway -Name tempLng -ResourceGroupName $AzureStackResourceGroup_HA





Clear-AzureRmContext -Force

#Connection to HA Site 
Import-AzureRmContext -Path $Curr_Dir$FileName_DR_Context
$jumpbox = Read-Host "do you want to enable/disable jumpbox vm in the DR site"\n " 1. Enabled" \n "2.Disabled"

New-AzureRmResourceGroupDeployment -Name "AzureStack-DR-Part2-Deployment" -ResourceGroupName $AzureStackResourceGroup_DR -TemplateFile $azureStackTemplateLocation_DR_part2 -TemplateParameterFile $azureStackParamLocation -location $region_DR -jumpbox $jumpbox -privateIP $privateIP -Mode Incremental
Read-Host "AzureStack DR Deployment is done... Press any key to continue"

Clear-AzureRmContext -Force
#endregion

#region Deleting Context files
if (Test-Path $Curr_Dir$FileName_HA_Context) 
{
  Remove-Item $Curr_Dir$FileName_HA_Context
} 
if (Test-Path $Curr_Dir$FileName_DR_Context) 
{
  Remove-Item $Curr_Dir$FileName_DR_Context
}
#endregion
