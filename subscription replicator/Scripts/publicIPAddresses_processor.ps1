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

$publicIp = Get-AzureRmResource -ResourceGroupName $resourceJSON.resourceGroupName -Name $resourceJSON.Name

$location = $resourceJSON.Location
$publicIPAddressName = $resourceJSON.Name
$sku = $publicIp.Sku.Name
$publicIPAllocationMethod = $resourceJSON.Properties.publicIPAllocationMethod
$idleTimeoutInMinutes = $resourceJSON.Properties.idleTimeoutInMinutes
$publicIpAddressVersion = $resourceJSON.Properties.publicIPAddressVersion
$domainNameLabel = $resourceJSON.Properties.dnsSettings.domainNameLabel

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
        "publicIPAddressName":  {
            "value":  "$publicIPAddressName"
        },
        "sku":  {
            "value":  "Basic"
        },
        "publicIPAllocationMethod":  {
            "value":  "$publicIPAllocationMethod"
        },
        "idleTimeoutInMinutes":  {
            "value":  $idleTimeoutInMinutes
        },
        "publicIpAddressVersion":  {
            "value":  "$publicIpAddressVersion"
        },
        "domainNameLabel":  {
            "value":  "$domainNameLabel"
        }
    }
}
"@

#create custom ARM template
.\publicIPAddresses_ARM_Template_Generator.ps1 -ResourceJSON $resourceJSON -armAPIVersion $armAPIVersion

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