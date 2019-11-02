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
$virtualNetworkGatewayName = $resourceJSON.Name
$sku = $resourceJSON.Properties.sku.name
$gatewayType = $resourceJSON.Properties.gatewayType
$vpnType = $resourceJSON.Properties.vpnType
$subnetId = $resourceJSON.Properties.ipConfigurations[0].properties.subnet.id
$publicIpAddressId = $resourceJSON.Properties.ipConfigurations[0].properties.publicIPAddress.id
$activeActive = ($resourceJSON.Properties.activeActive).ToString().ToLower()
$activeActiveGatewayPublicIpAddressId = $resourceJSON.Properties.ipConfigurations[1].properties.publicIPAddress.id
$enableBgp = ($resourceJSON.Properties.enableBgp).ToString().ToLower()
$asn = $resourceJSON.Properties.bgpSettings.asn

#special case for asn, need to pass a number to satisfy ARM template validation.
if(!$asn){
    $asn = 0
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
        "virtualNetworkGatewayName":  {
            "value":  "$virtualNetworkGatewayName"
        },
        "sku": {
            "value": "$sku"
        },
        "gatewayType": {
            "value": "$gatewayType"
        },
        "vpnType": {
            "value": "$vpnType"
        },
        "subnetId": {
            "value": "$subnetId"
        },
        "publicIpAddressId": {
            "value": "$publicIpAddressId"
        },
        "activeActive": {
            "value": $activeActive
        },
        "activeActiveGatewayPublicIpAddressId": {
            "value": "$activeActiveGatewayPublicIpAddressId"
        },
        "enableBgp": {
            "value": $enableBgp
        },
        "asn": {
            "value": $asn
        }
    }
}
"@

#create custom ARM template
.\virtualNetworkGateways_ARM_Template_Generator.ps1 -ResourceJSON $resourceJSON -armAPIVersion $armAPIVersion

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