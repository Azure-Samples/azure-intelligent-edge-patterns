#

param(
    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion,

    [Parameter(Mandatory=$true)]
    [String]$nicArmAPIVersion
)

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)

$nicObject = Get-AzureRmResource -ResourceId $resourceJSON.Properties.networkProfile.networkInterfaces.id


$datadisk_names = $resourceJSON.Properties.storageProfile.dataDisks.name
$availabilitySetId = $resourceJSON.Properties.availabilitySet.id
$bootDiagnostics_storageUri = $resourceJSON.Properties.diagnosticsProfile.bootDiagnostics.storageUri
$nsgId = $nicObject.Properties.networkSecurityGroup.id
$publicIpId = $nicObject.Properties.ipConfigurations.properties.publicIPAddress
$WindowsOS = $resourceJSON.Properties.OSProfile.WindowsConfiguration

#datadisks
if($datadisk_names){
    #datadisk portion of ARM template
    #datadisks are present need to provide code to handle that
    $datadiskTemplating = 
@"
,
              "copy":[
                  {
                      "name": "dataDisks",
                      "count": "[length(parameters('datadisk_name'))]",
                      "input": {
                          "name": "[parameters('datadisk_name')[copyIndex('dataDisks')]]",
                          "diskSizeGB": "[parameters('datadisk_diskSizeGB')[copyIndex('dataDisks')]]",
                          "lun": "[parameters('datadisk_lun')[copyIndex('dataDisks')]]",
                          "createOption": "[parameters('datadisk_createOption')[copyIndex('dataDisks')]]"
                      }
                  }
              ]
"@
}
else{
    $datadiskTemplating = ""
}

#availability sets
if($availabilitySetId){
    #availabilitySet portion of ARM template
    #availability sets are present need to provide code to handle that
    $availabilitySetTemplating = 
@"
,
          "availabilitySet": {
              "id": "[parameters('availabilitySetId')]"
          }
"@
}
else{
    $availabilitySetTemplating = ""
}

#boot diagnostics
if($bootDiagnostics_storageUri){
    $bootDiagnosticsTemplating = 
@"
,
                "diagnosticsProfile": {
                    "bootDiagnostics": {
                        "enabled": true,
                        "storageUri": "[parameters('bootDiagnostics_storageUri')]"
                    }
                }
"@
}
else{
    $bootDiagnosticsTemplating = ""
}

#nsg
if($nsgId){
  $nsgTemplating = 
@"
,
                "networkSecurityGroup": {
                    "id": "[parameters('nsgId')]"
                }
"@
}
else{
  $nsgTemplating = ""
}

#public IP
if($publicIpId){
  $publicIpTemplating = 
@"
,
                            "publicIpAddress": {
                                "id": "[parameters('publicIpId')]"
                            }
"@
}else{
  $publicIpTemplating = ""
}

#Os Profile
if($WindowsOS){
  #Windows OS
  $OsProfileTemplating = 
@"
            "osProfile": {
              "computerName": "[parameters('virtualMachineName')]",
              "adminUsername": "[parameters('adminUsername')]",
              "adminPassword": "[parameters('adminPassword')]",
                "windowsConfiguration": {
                  "provisionVmAgent": "true"
                }
"@
} else {
  #Linux OS
  $OsProfileTemplating =
@"
            "osProfile": {
              "computerName": "[parameters('virtualMachineName')]",
              "adminUsername": "[parameters('adminUsername')]",
              "adminPassword": "[parameters('adminPassword')]"
"@  
}


$armTemplate = 
@"
{
    "`$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "armAPIVersion": {
          "type": "string"
        },
        "nicArmAPIVersion": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "virtualMachineName": {
          "type": "string"
        },
        "virtualMachineSize": {
          "type": "string"
        },
        "adminUsername": {
          "type": "string"
        },
        "adminPassword": {
          "type": "SecureString"
        },
        "publisher": {
          "type": "string"
        },
        "offer": {
          "type": "string"
        },
        "sku": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "createOption": {
          "type": "string"
        },
        "storageAccountType": {
          "type": "string",
          "defaultValue": "Standard_LRS"
        },
        "datadisk_name": {
            "type": "Array"
        },
        "datadisk_diskSizeGB": {
          "type": "Array"
        },
        "datadisk_lun": {
          "type": "Array"
        },
        "datadisk_createOption": {
          "type": "Array"
        },
        "networkInterfaceName": {
          "type": "string"
        },
        "ipConfigurations_Name": {
            "type": "string"
        },
        "subnetId": {
          "type": "string"
        },  
        "ipConfigurations_privateIPAllocationMethod": {
          "type": "string"
        },
        "ipConfigurations_privateIPAddress": {
          "type": "string"
        },
        "ipConfigurations_privateIPAddressVersion": {
          "type": "string"
        },
        "availabilitySetId": {
          "type": "string",
          "defaultValue": "notProvided"
        },
        "bootDiagnostics_storageUri": {
          "type": "string",
          "defaultValue": "notProvided"
        },
        "nsgId":{
          "type": "string",
          "defaultValue": "notProvided"
        },
        "publicIpId":{
          "type": "string",
          "defaultValue": "notProvided"
        }
    },
    "variables": {
    },
    "resources": [
      {
          "type": "Microsoft.Compute/virtualMachines",
          "name": "[parameters('virtualMachineName')]",
          "apiVersion": "[parameters('armAPIVersion')]",
          "location": "[parameters('location')]",
          "properties": {
            $OsProfileTemplating
          },
            "hardwareProfile": {
              "vmSize": "[parameters('virtualMachineSize')]"
            },
            "storageProfile": {
              "imageReference": {
                "publisher": "[parameters('publisher')]",
                "offer": "[parameters('offer')]",
                "sku": "[parameters('sku')]",
                "version": "[parameters('version')]"
              },
              "osDisk": {
                "createOption": "[parameters('createOption')]",
                "managedDisk": {
                  "storageAccountType": "[parameters('storageAccountType')]"
                }
              }$datadiskTemplating
            },
            "networkProfile": {
              "networkInterfaces": [
                {
                  "id": "[resourceId('Microsoft.Network/networkInterfaces', parameters('networkInterfaceName'))]"
                }
              ]
            }$availabilitySetTemplating$bootDiagnosticsTemplating
          },
          "dependsOn": [
            "[concat('Microsoft.Network/networkInterfaces/', parameters('networkInterfaceName'))]"
          ]
        },
        {
          "type": "Microsoft.Network/networkInterfaces",
          "name": "[parameters('networkInterfaceName')]",
          "apiVersion": "[parameters('nicArmAPIVersion')]",
          "location": "[parameters('location')]",
          "properties": {
            "ipConfigurations": [
              {
                "name": "[parameters('ipConfigurations_Name')]",
                "properties": {
                  "subnet": {
                    "id": "[parameters('subnetId')]"
                  },
                  "privateIPAllocationMethod": "[parameters('ipConfigurations_privateIPAllocationMethod')]",
                  "privateIPAddress": "[parameters('ipConfigurations_privateIPAddress')]",
                  "privateIPAddressVersion": "[parameters('ipConfigurations_privateIPAddressVersion')]"$publicIpTemplating
                }
              }
            ]$nsgTemplating
          },
          "dependsOn": [
          ]
        }
    ],
    "outputs": {
      "adminUsername": {
          "type": "string",
          "value": "[parameters('adminUsername')]"
        }
    }
  }
"@

$armTemplate | Out-File -FilePath "$pwd\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json"

