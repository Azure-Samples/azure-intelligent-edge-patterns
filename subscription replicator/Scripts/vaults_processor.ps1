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

$location = $resourceJSON.Location
$vaultName = $resourceJSON.Name 
$sku = $resourceJSON.Properties.sku.name
$family = $resourceJSON.Properties.sku.family
$accessPolicies = $resourceJSON.Properties.accessPolicies | ConvertTo-Json
$tenant = $resourceJSON.Properties.tenantId
$enabledForDeployment = ($resourceJSON.Properties.enabledForDeployment).ToString().ToLower()
$enabledForTemplateDeployment = ($resourceJSON.Properties.enabledForTemplateDeployment).ToString().ToLower()
$enabledForDiskEncryption = ($resourceJSON.Properties.enabledForDiskEncryption).ToString().ToLower()


#network ACLs: Data not retrievable with cmdlets, must change post resource processing or post resource deployment
#if more permanent change is required change the values here
$networkAcls_defaultAction = "Allow"
$networkAcls_bypass = "AzureServices"

$parametersFile = 
@"
{
    "`$schema":  "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion":  "1.0.0.0",
    "parameters":  {
        "armAPIVersion": {
          "value": "$armAPIVersion"
        },
        "location": {
            "value": "$location"
        },
        "vaultName": {
            "value": "$vaultName"
        },
        "sku": {
            "value": "$sku"
        },
        "family": {
            "value": "$family"
        },
        "accessPolicies": {
            "value": [
                $accessPolicies
            ]
        },
        "tenant": {
            "value": "$tenant"
        },
        "enabledForDeployment": {
            "value": $enabledForDeployment
        },
        "enabledForTemplateDeployment": {
            "value": $enabledForTemplateDeployment
        },
        "enabledForDiskEncryption": {
            "value": $enabledForDiskEncryption
        },
        "networkAcls": {
            "value": {
                "defaultAction": "$networkAcls_defaultAction",
                "bypass": "$networkAcls_bypass",
                "virtualNetworkRules": [],
                "ipRules": []
            }
        }
    }
}
"@

#post process

.\post_process.ps1 -parametersFile $parametersFile `
                   -resourceJSON $resourceJSON `
                   -sourceSubscriptionId $sourceSubscriptionId `
                   -targetSubscriptionId $targetSubscriptionId `
                   -sourceLocation $sourceLocation `
                   -targetLocation $targetLocation `
                   -sourceTenantId $sourceTenantId `
                   -targetTenantId $targetTenantId `
                   -resourceType $resourceType `
                   -parallel $parallel