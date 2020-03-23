#

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

$location = "$($resourceJSON.Location)"
$virtualMachineName = "$($resourceJSON.Name)"
$virtualMachineSize = "$($resourceJSON.Properties.hardwareProfile.vmSize)"
$adminUsername = "$($resourceJSON.Properties.osProfile.adminUsername)"
$publisher = "$($resourceJSON.Properties.storageProfile.imageReference.publisher)"
$offer = "$($resourceJSON.Properties.storageProfile.imageReference.offer)"
$sku = "$($resourceJSON.Properties.storageProfile.imageReference.sku)"
$version = "$($resourceJSON.Properties.storageProfile.imageReference.version)"
$createOption = "$($resourceJSON.Properties.storageProfile.osDisk.createOption)"
$storageAccountType = "$($resourceJSON.Properties.storageProfile.osDisk.managedDisk.storageAccountType)"
$datadisk_name = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.name) -join {", "})""]"
$datadisk_diskSizeGB = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.diskSizeGB) -join {", "})""]"
$datadisk_lun = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.lun) -join {", "})""]"
$datadisk_createOption = "[""$(($resourceJSON.Properties.storageProfile.dataDisks.createOption) -join {", "})""]"
$networkInterfaceName = "$($nicObject.Name)"
$ipConfigurations_Name = "$($nicObject.Properties.ipConfigurations.name)"
$subnetId = "$($nicObject.Properties.ipConfigurations.properties.subnet.id)"
$ipConfigurations_privateIPAllocationMethod = "$($nicObject.Properties.ipConfigurations.properties.privateIPAllocationMethod)"
$ipConfigurations_privateIPAddress = "$($nicObject.Properties.ipConfigurations.properties.privateIPAddress)"
$ipConfigurations_privateIPAddressVersion = "$($nicObject.Properties.ipConfigurations.properties.privateIPAddressVersion)"
$availabilitySetId = $resourceJSON.Properties.availabilitySet.id
$bootDiagnostics_storageUri = $resourceJSON.Properties.diagnosticsProfile.bootDiagnostics.storageUri
$nsgId = $nicObject.Properties.networkSecurityGroup.id
$publicIpId = $nicObject.Properties.ipConfigurations.properties.publicIPAddress.id

#check storageAccountType, if the source VM is Powered Off, or if it uses unmanaged disks this will be Null 
#if that's the case, we fix it here
if(!$storageAccountType){
  #Unmanaged Disk
  $vhdUri = $resourceJSON.Properties.storageProfile.osDisk.vhd.uri
  if($vhdUri){
    $osDiskStorageAccountName = $vhdUri.Substring(8, $vhdUri.IndexOf(".") - 8)
    $osDiskStorageAccountRG = (Get-AzureRmStorageAccount | Where-Object { $PSItem.StorageAccountName -eq $osDiskStorageAccountName }).ResourceGroupName
    $osDiskStorageAccount = Get-AzureRmStorageAccount -ResourceGroupName $osDiskStorageAccountRG -Name $osDiskStorageAccountName
    $storageAccountType = $osDiskStorageAccount.Sku.Name.ToString()
  } else {
    #Powered Off VM (with Managed OS Disk)
    $osDiskName = $resourceJSON.Properties.StorageProfile.OsDisk.Name
    $storageAccountType = (Get-AzureRmDisk -DiskName $osDiskName).Sku.Name
  }
  if(!($storageAccountType -like "*_*")){
    $storageAccountType = $storageAccountType.Insert($storageAccountType.Length - 3, "_")
  }
}

#if data disks exist, check the size property in case the VM is Powered Off (Managed Disks)
if($datadisk_name){
  #check if the '$datadisk_diskSizeGB' is null, if so, loop for each object to get the size
  if(!($datadisk_diskSizeGB -match '[0-9]')){
    foreach($datadisk in $resourceJSON.Properties.storageProfile.dataDisks.name){
      [array]$datadisk_sizes += (Get-AzureRMDisk -DiskName $datadisk).DiskSizeGB
    }
    $datadisk_diskSizeGB = "[""$(($datadisk_sizes) -join {", "})""]"
  }
}
#set the data disk "createOption" property to Empty
if($datadisk_createOption){
  $datadisk_createOption = $datadisk_createOption.Replace("Attach", "Empty")
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