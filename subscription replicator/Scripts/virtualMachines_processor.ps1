

param(
    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion,

    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$sourceSubscriptionId,

    [Parameter(Mandatory=$true)]
    [String]$targetSubscriptionId,

    [Parameter(Mandatory=$true)]
    [String]$sourceLocation,

    [Parameter(Mandatory=$true)]
    [String]$targetLocation,

    [Parameter(Mandatory=$true)]
    [String]$sourceTenantId,

    [Parameter(Mandatory=$true)]
    [String]$targetTenantId,
    
    [Parameter(Mandatory=$true)]
    [String]$resourceType,

    [Parameter(Mandatory=$true)]
    [bool]$parallel
)

#pull parameter values from resource json 

$nicObject = Get-AzureRmResource -ResourceId $resourceJSON.Properties.networkProfile.networkInterfaces.id

[string]$location = "$($resourceJSON.Location)"
[string]$virtualMachineName = "$($resourceJSON.Name)"
[string]$virtualMachineSize = "$($resourceJSON.Properties.hardwareProfile.vmSize)"
[string]$adminUsername = "$($resourceJSON.Properties.osProfile.adminUsername)"
[string]$publisher = "$($resourceJSON.Properties.storageProfile.imageReference.publisher)"
[string]$offer = "$($resourceJSON.Properties.storageProfile.imageReference.offer)"
[string]$sku = "$($resourceJSON.Properties.storageProfile.imageReference.sku)"
[string]$version = "$($resourceJSON.Properties.storageProfile.imageReference.version)"
[string]$createOption = "$($resourceJSON.Properties.storageProfile.osDisk.createOption)"
[string]$storageAccountType = "$($resourceJSON.Properties.storageProfile.osDisk.managedDisk.storageAccountType)"
[string]$datadisk_name = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.name) -join {", "})""]"
[string]$datadisk_diskSizeGB = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.diskSizeGB) -join {", "})""]"
[string]$datadisk_lun = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.lun) -join {", "})""]"
[string]$datadisk_createOption = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.createOption) -join {", "})""]"
[string]$networkInterfaceName = "$($nicObject.Name)"
[string]$ipConfigurations_Name = "$($nicObject.Properties.ipConfigurations.name)"
[string]$subnetId = "$($nicObject.Properties.ipConfigurations.properties.subnet.id)"
[string]$ipConfigurations_privateIPAllocationMethod = "$($nicObject.Properties.ipConfigurations.properties.privateIPAllocationMethod)"
[string]$ipConfigurations_privateIPAddress = "$($nicObject.Properties.ipConfigurations.properties.privateIPAddress)"
[string]$ipConfigurations_privateIPAddressVersion = "$($nicObject.Properties.ipConfigurations.properties.privateIPAddressVersion)"
[string]$availabilitySetId = $resourceJSON.Properties.availabilitySet.id
[string]$bootDiagnostics_storageUri = $resourceJSON.Properties.diagnosticsProfile.bootDiagnostics.storageUri
[string]$nsgId = $nicObject.Properties.networkSecurityGroup.id
[string]$publicIpId = $nicObject.Properties.ipConfigurations.properties.publicIPAddress.id

#check storageAccountType, if the source VM is Powered Off, or if it uses unmanaged disks this will be Null 
#if that's the case, we fix it here
if(!$storageAccountType){
  #Unmanaged Disk
  $vhdUri = $resourceJSON.Properties.storageProfile.osDisk.vhd.uri
  if($vhdUri){
    $osDiskStorageAccountName = $vhdUri.Substring(8, $vhdUri.IndexOf(".") - 8)
    $osDiskStorageAccountRG = (Get-AzureRmStorageAccount | Where-Object { $PSItem.StorageAccountName -eq $osDiskStorageAccountName }).ResourceGroupName
    $osDiskStorageAccount = Get-AzureRmStorageAccount -ResourceGroupName $osDiskStorageAccountRG -Name $osDiskStorageAccountName
    [string]$storageAccountType = $osDiskStorageAccount.Sku.Name.ToString()
  } else {
    #Powered Off VM (with Managed OS Disk)
    $osDiskName = $resourceJSON.Properties.StorageProfile.OsDisk.Name
    $osDiskResourceID = $resourceJSON.Properties.StorageProfile.OsDisk.ManagedDisk.Id
    $OsDiskResourceGroup = ($osDiskResourceID.Split("/"))[4]
    [string]$storageAccountType = (Get-AzureRmDisk -Name $osDiskName -ResourceGroupName $OsDiskResourceGroup).Sku.Name
  }
  #Insert an underscore "_" in the storageAccountType if missing, include error checking for length
  if(!($storageAccountType -like "*_*")){
    if($storageAccountType.Length -ge 8){
      [string]$storageAccountType = $storageAccountType.Insert($storageAccountType.Length - 3, "_")
    } else {
      Write-Error "Invalid Storage Account Type data retrieved for VM $($virtualMachineName)"
    }
  }
}

#if data disks exist, check the size property in case the VM is Powered Off (Managed Disks)
if($datadisk_name){
  #check if the '$datadisk_diskSizeGB' is null, if so, loop for each object to get the size
  if(!($datadisk_diskSizeGB -match '[0-9]')){
    [array]$datadisk_sizes = @()
    foreach($datadisk in $resourceJSON.Properties.storageProfile.dataDisks.name){
      [array]$datadisk_sizes += (Get-AzureRMDisk | Where-Object {$PSItem.Name -eq $datadisk} | Select-Object DiskSizeGB)
    }
    [string]$datadisk_diskSizeGB = "[""$(($datadisk_sizes.DiskSizeGB) -join {", "})""]"
  }
}
#set the data disk "createOption" property to Empty
if($datadisk_createOption){
  [string]$datadisk_createOption = $datadisk_createOption.Replace("Attach", "Empty")
}

#special case
#need api version for NIC deployment

$providerNameSpace = "Microsoft.Network"
$resourceProvider = Get-AzureRmResourceProvider -ProviderNamespace $providerNameSpace | Where-object -FilterScript {$_.ResourceTypes.ResourceTypeName -eq "networkInterfaces"}
$nicArmAPIVersion = $resourceProvider.ResourceTypes.ApiVersions[0]

#insert retrieved values into parameters file template

$parametersFile = 
@"
{
    "`$schema":  "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion":  "1.0.0.0",
    "parameters":  {
          "armAPIVersion": {
            "value": "$armAPIVersion"
          },
          "nicArmAPIVersion": {
            "value": "$nicArmAPIVersion"
          },
          "location": {
            "value": "$location"
          },
          "virtualMachineName": {
            "value": "$virtualMachineName"
          },
          "virtualMachineSize": {
            "value": "$virtualMachineSize"
          },
          "adminUsername": {
            "value": "$adminUsername"
          },
          "publisher": {
            "value": "$publisher"
          },
          "offer": {
            "value": "$offer"
          },
          "sku": {
            "value": "$sku"
          },
          "version": {
            "value": "$version"
          },
          "createOption": {
            "value": "$createOption"
          },
          "storageAccountType": {
            "value": "$storageAccountType"
          },
          "datadisk_name": {
              "value": $datadisk_name
          },
          "datadisk_diskSizeGB": {
            "value": $datadisk_diskSizeGB
          },
          "datadisk_lun": {
            "value": $datadisk_lun
          },
          "datadisk_createOption": {
            "value": $datadisk_createOption
          },
          "networkInterfaceName": {
            "value": "$networkInterfaceName"
          },
          "ipConfigurations_Name": {
              "value": "$ipConfigurations_Name"
          },
          "subnetId": {
            "value": "$subnetId"
          },  
          "ipConfigurations_privateIPAllocationMethod": {
            "value": "$ipConfigurations_privateIPAllocationMethod"
          },
          "ipConfigurations_privateIPAddress": {
            "value": "$ipConfigurations_privateIPAddress"
          },
          "ipConfigurations_privateIPAddressVersion": {
            "value": "$ipConfigurations_privateIPAddressVersion"
          },
          "availabilitySetId": {
            "value": "$availabilitySetId"
          },
          "bootDiagnostics_storageUri": {
            "value": "$bootDiagnostics_storageUri"
          },
          "nsgId": {
            "value": "$nsgId"
          },
          "publicIpId": {
            "value": "$publicIpId"
          }
    }
}
"@


#create custom ARM template
.\virtualMachines_ARM_Template_Generator.ps1 -ResourceJSON $resourceJSON -armAPIVersion $armAPIVersion -NICarmAPIVersion $nicArmAPIVersion


#post process

$additionalDeployParams = 
@"
``
                                    -adminPassword `$vmAdminPassword 
"@

.\post_process.ps1 -parametersFile $parametersFile `
                   -resourceJSON $resourceJSON `
                   -sourceSubscriptionId $sourceSubscriptionId `
                   -targetSubscriptionId $targetSubscriptionId `
                   -sourceLocation $sourceLocation `
                   -targetLocation $targetLocation `
                   -sourceTenantId $sourceTenantId `
                   -targetTenantId $targetTenantId `
                   -additionalDeployParams $additionalDeployParams `
                   -resourceType $resourceType `
                   -parallel $parallel
