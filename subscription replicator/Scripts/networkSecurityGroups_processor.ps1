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

[String]$location = $resourceJSON.Location
[String]$networkSecurityGroupName = $resourceJSON.Name

$networkSecurityGroupRules = $resourceJSON.Properties.securityRules | Select-Object name, properties | ConvertTo-Json

if($resourceJSON.Properties.securityRules.Length -eq 1){
    $networkSecurityGroupRules = $networkSecurityGroupRules.insert(0, "[`n")
    $networkSecurityGroupRules += "`n]"
}

if(!$networkSecurityGroupRules){
    $networkSecurityGroupRules = "[]"
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
        "networkSecurityGroupName":  {
            "value":  "$networkSecurityGroupName"
        },
        "networkSecurityGroupRules": {
            "value": $networkSecurityGroupRules
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