#

param(
    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion
)

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)
$activeActive = $resourceJSON.Properties.activeActive

$enableBgp = $resourceJSON.Properties.enableBgp

if($enableBgp){
    $enableBgpTemplating = 
@"
,
                "enableBgp": "[parameters('enableBgp')]",
                "bgpSettings": {
                    "asn": "[parameters('asn')]"
                }
"@
}
else{
    $enableBgpTemplating = ""
}

if($activeActive){
    $activeActiveTemplating = 
@"
,
                    {
                        "name": "activeActive",
                        "properties": {
                            "privateIPAllocationMethod": "Dynamic",
                            "publicIpAddress": {
                                "id": "[parameters('activeActiveGatewayPublicIpAddressId')]"
                            },
                            "subnet": {
                                "id": "[parameters('subnetId')]"
                            }
                        }
                    }
"@
    $activeActiveTemplating02 = 
@"

                "activeActive": "[parameters('activeActive')]",
"@
}
else{
    $activeActiveTemplating = ""
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
        "location": {
            "type": "string"
        },
        "virtualNetworkGatewayName": {
            "type": "string"
        },
        "sku": {
            "type": "string"
        },
        "gatewayType": {
            "type": "string",
            "defaultValue": "Vpn",
            "allowedValues": [
                "Vpn",
                "ExpressRoute"
            ]
        },
        "vpnType": {
            "type": "string",
            "defaultValue": "RouteBased",
            "allowedValues": [
                "RouteBased",
                "PolicyBased"
            ]
        },
        "subnetId": {
            "type": "string"
        },
        "publicIpAddressId": {
            "type": "string"
        },
        "activeActive": {
            "type": "Bool"
        },
        "activeActiveGatewayPublicIpAddressId": {
            "type": "String"
        },
        "enableBgp": {
            "type": "Bool"
        },
        "asn": {
            "type": "Int"
        }
    },
    "resources": [
        {
            "apiVersion": "[parameters('armAPIVersion')]",
            "name": "[parameters('virtualNetworkGatewayName')]",
            "type": "Microsoft.Network/virtualNetworkGateways",
            "location": "[parameters('location')]",
            "dependsOn": [
            ],
            "tags": {},
            "properties": {
                "gatewayType": "[parameters('gatewayType')]",
                "ipConfigurations": [
                    {
                        "name": "default",
                        "properties": {
                            "privateIPAllocationMethod": "Dynamic",
                            "subnet": {
                                "id": "[parameters('subnetId')]"
                            },
                            "publicIpAddress": {
                                "id": "[parameters('publicIpAddressId')]"
                            }
                        }
                    }$activeActiveTemplating
                ],$activeActiveTemplating02
                "vpnType": "[parameters('vpnType')]",
                "sku": {
                    "name": "[parameters('sku')]",
                    "tier": "[parameters('sku')]"
                }$enableBgpTemplating
            }
        }
    ]
}
"@

$armTemplate | Out-File -FilePath "$pwd\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json"

