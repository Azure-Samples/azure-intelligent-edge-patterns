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

$lb = Get-AzureRmLoadBalancer -ResourceGroupName $resourceJSON.resourceGroupName -Name $resourceJSON.Name

$location = $resourceJSON.Location
$loadBalancerName = $resourceJSON.Name
$sku = $lb.Sku.Name
$subnetId = $resourceJSON.Properties.frontendIPConfigurations.properties.subnet.id
$privateIPAllocationMethod = $resourceJSON.Properties.frontendIPConfigurations.properties.privateIPAllocationMethod
$privateIPAddress = $resourceJSON.Properties.frontendIPConfigurations.properties.privateIPAddress
$publicIPAddressId = $resourceJSON.Properties.frontendIPConfigurations.properties.publicIPAddress.id

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
        "loadBalancerName":  {
            "value":  "$loadBalancerName"
        },
        "sku":  {
            "value":  "$sku"
        },
        "subnetId":  {
            "value":  "$subnetId"
        },
        "privateIPAllocationMethod":  {
            "value":  "$privateIPAllocationMethod"
        },
        "privateIPAddress": {
            "value": "$privateIPAddress"
        },
        "publicIPAddress": {
            "value": "$publicIPAddressId"
        }
    }
}
"@

#create custom ARM template
.\loadBalancers_ARM_Template_Generator.ps1 -ResourceJSON $resourceJSON -armAPIVersion $armAPIVersion

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