#

param(
    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion
)

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)

$privateIPAllocationMethod = $resourceJSON.Properties.frontendIPConfigurations.properties.privateIPAllocationMethod

$privateIPAddress = $resourceJSON.Properties.frontendIPConfigurations.properties.privateIPAddress
$publicIPAddressId = $resourceJSON.Properties.frontendIPConfigurations.properties.publicIPAddress.id

if($privateIPAddress){
    $privateIPAddressTemplating = 
@"
"privateIPAllocationMethod": "[parameters('privateIPAllocationMethod')]",
                            "subnet": {
                                "id": "[parameters('subnetId')]"
                            }
"@
    if($privateIPAllocationMethod -like "*Static*"){
        #Static IP allocation portion of ARM template
        #need to provide a static IP to ARM template and need to provide code to handle that
        $privateIPAddressTemplating += 
@"
,
                            "privateIPAddress": "[parameters('privateIPAddress')]"

"@
    }
}
else{
    $privateIPAddressTemplating = ""
}

if($publicIPAddressId){
    $publicIPAddressTemplating = 
@"
"publicIPAddress": {
                                "id": "[parameters('publicIPAddress')]"
                            }
"@
}
else{
    $publicIPAddressTemplating = ""
}

$armTemplate = 
@"
{
    "`$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "armAPIVersion": {
            "type": "String"
        },
        "location": {
            "type": "String"
        },
        "loadBalancerName": {
            "type": "String"
        },
        "sku": {
            "type": "String"
        },
        "subnetId": {
            "type": "String"
        },
        "privateIPAllocationMethod": {
            "type": "String"
        },
        "privateIPAddress": {
            "type": "String",
            "defaultValue": "notProvided"
        },
        "publicIPAddress": {
            "type": "String",
            "defaultValue": "notProvided"
        }
    },
    "resources": [
        {
            "type": "Microsoft.Network/loadBalancers",
            "apiVersion": "[parameters('armAPIVersion')]",
            "name": "[parameters('loadBalancerName')]",
            "location": "[parameters('location')]",
            "dependsOn": [],
            "tags": {},
            "sku": {
                "name": "[parameters('sku')]"
            },
            "properties": {
                "frontendIPConfigurations": [
                    {
                        "name": "LoadBalancerFrontEnd",
                        "properties": {
                            $privateIPAddressTemplating
                            $publicIPAddressTemplating
                        }
                    }
                ]
            }
        }
    ]
}
"@

$armTemplate | Out-File -FilePath "$pwd\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json"

