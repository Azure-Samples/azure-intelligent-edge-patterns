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
$virtualNetworkName = $resourceJSON.Name
$addressPrefixes = $resourceJSON.Properties.addressSpace.addressPrefixes | ConvertTo-Json
$subnetName = "[""$(($resourceJSON.Properties.subnets.name) -join {", "})""]"
$subnetPrefix = "[""$(($resourceJSON.Properties.subnets.properties.addressPrefix) -join {", "})""]"

#if only one VNet address prefix need to add brackets around the address prefix
if(!($addressPrefixes[0] -eq "[")){
    $addressPrefixes = "[$addressPrefixes]"
}

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
        "virtualNetworkName":  {
            "value":  "$virtualNetworkName"
        },
        "addressPrefixes":  {
            "value":  $addressPrefixes
        },
        "subnetName":  {
            "value":  $subnetName
        },
        "subnetPrefix":  {
            "value":  $subnetPrefix
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