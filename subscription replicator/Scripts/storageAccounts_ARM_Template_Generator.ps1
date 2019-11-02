#

param(
    [Parameter(Mandatory=$true)]
    [Object]$resourceJSON,

    [Parameter(Mandatory=$true)]
    [String]$armAPIVersion
)

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)

$accessTier = $resourceJSON.Properties.accessTier

if($accessTier){
    $accessTierTemplating = 
@"
,
              "accessTier": "[parameters('accessTier')]"
"@
}
else{
    $accessTierTemplating = ""
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
          "type": "string"
      },
      "storageAccountName": {
          "type": "string"
      },
      "accountType": {
          "type": "string"
      },
      "kind": {
          "type": "string"
      },
      "accessTier": {
          "type": "string"
      },
      "supportsHttpsTrafficOnly": {
          "type": "bool"
      }
    },
    "variables": {
    },
    "resources": [
      {
          "name": "[parameters('storageAccountName')]",
          "type": "Microsoft.Storage/storageAccounts",
          "apiVersion": "[parameters('armAPIVersion')]",
          "location": "[parameters('location')]",
          "properties": {
              "supportsHttpsTrafficOnly": "[parameters('supportsHttpsTrafficOnly')]"$accessTierTemplating
          },
          "dependsOn": [],
          "sku": {
              "name": "[parameters('accountType')]"
          },
          "kind": "[parameters('kind')]"
      }
    ],
    "outputs": {
    }
}
"@

$armTemplate | Out-File -FilePath "$pwd\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json"

