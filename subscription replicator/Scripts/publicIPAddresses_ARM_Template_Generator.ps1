#

param(
    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion
)

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)

$domainNameLabel = $resourceJSON.Properties.dnsSettings.domainNameLabel

if($domainNameLabel){
    $domainNameLabelTemplating = 
@"
,
                "dnsSettings": {
                    "domainNameLabel": "[parameters('domainNameLabel')]"
                }
"@
}
else{
    $domainNameLabelTemplating = ""
}

$armTemplate = 
@"
{
    "`$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "armAPIVersion": {
            "type": "String"
        },
        "location": {
            "type": "String"
        },
        "publicIPAddressName": {
            "type": "String"
        },
        "sku": {
            "allowedValues": [
                "Basic",
                "Standard"
            ],
            "type": "String"
        },
        "publicIPAllocationMethod": {
            "allowedValues": [
                "Dynamic",
                "Static"
            ],
            "type": "String"
        },
        "idleTimeoutInMinutes": {
            "type": "Int"
        },
        "publicIpAddressVersion": {
            "type": "String"
        },
        "domainNameLabel": {
            "type": "String",
            "defaultValue": "notProvided"
        }
    },
    "resources": [
        {
            "type": "Microsoft.Network/publicIPAddresses",
            "apiVersion": "[parameters('armAPIVersion')]",
            "name": "[parameters('publicIPAddressName')]",
            "location": "[parameters('location')]",
            "sku": {
                "name": "[parameters('sku')]"
            },
            "properties": {
                "publicIPAllocationMethod": "[parameters('publicIPAllocationMethod')]",
                "idleTimeoutInMinutes": "[parameters('idleTimeoutInMinutes')]",
                "publicIpAddressVersion": "[parameters('publicIpAddressVersion')]"$domainNameLabelTemplating
            }
        }
    ]
}
"@

$armTemplate | Out-File -FilePath "$pwd\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json"

