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
$storageAccountName = $resourceJSON.Name
$accountType = $resourceJSON.Sku.Name
$kind = $resourceJSON.Kind
$accessTier = $resourceJSON.Properties.accessTier
$supportsHttpsTrafficOnly = ($resourceJSON.Properties.supportsHttpsTrafficOnly).ToString().ToLower()

$parametersFile = 
@"
{
    "`$schema":  "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion":  "1.0.0.0",
    "parameters":  {
        "armAPIVersion": {
          "value": "$armAPIVersion"
        },
        "location":  {
            "value":  "$location"
        },
        "storageAccountName":  {
            "value":  "$storageAccountName"
        },
        "accountType":  {
            "value":  "$accountType"
        },
        "kind":  {
            "value":  "$kind"
        },
        "accessTier":  {
            "value":  "$accessTier"
        },
        "supportsHttpsTrafficOnly":  {
            "value":  $supportsHttpsTrafficOnly
        }
    }
}
"@

#create custom ARM template
.\storageAccounts_ARM_Template_Generator.ps1 -ResourceJSON $resourceJSON -armAPIVersion $armAPIVersion

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