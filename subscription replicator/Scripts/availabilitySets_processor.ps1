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
$availabilitySetName = $resourceJSON.Name
$sku = $resourceJSON.Sku.Name
$availabilitySetPlatformFaultDomainCount = $resourceJSON.Properties.platformFaultDomainCount
$availabilitySetPlatformUpdateDomainCount = $resourceJSON.Properties.platformUpdateDomainCount

#check values
if($sku){
    #assumes new deployment is using managed disks exclusively for osdisks and datadisks
    $sku = $sku.Replace("Classic", "Aligned")
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
        "availabilitySetName":  {
            "value":  "$availabilitySetName"
        },
        "sku":  {
            "value":  "$sku"
        },
        "availabilitySetPlatformFaultDomainCount":  {
            "value":  $availabilitySetPlatformFaultDomainCount
        },
        "availabilitySetPlatformUpdateDomainCount":  {
            "value":  $availabilitySetPlatformUpdateDomainCount
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