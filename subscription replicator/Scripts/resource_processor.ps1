#

param(
    [Parameter(Mandatory=$true)]
    [String]$resourceJSONString,

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

#convert JSON String to PowerShell parseable object (PSCustomObject)
$resourceJSON = $resourceJSONString | ConvertFrom-JSON

Write-Output "Processing resource ""$($resourceJSON.Name)"" of type: ""$($resourceJSON.Type)"""

#determine which resource processor to use

$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)

$processor = "$($resourceTypeBase)_processor.ps1"

#determine which API version to use
$providerNameSpace = $resourceJSON.Type.Substring(0, $resourceJSON.Type.LastIndexOf("/"))
$resourceProvider = Get-AzureRmResourceProvider -ProviderNamespace $providerNameSpace | Where-object -FilterScript {$_.ResourceTypes.ResourceTypeName -eq "$resourceTypeBase"}
$armAPIVersion = $resourceProvider.ResourceTypes.ApiVersions[0]

Invoke-Expression -Command ".\$processor -armAPIVersion $armAPIVersion -resourceJSON `$resourceJSON -sourceSubscriptionId `$sourceSubscriptionId -targetSubscriptionId `$targetSubscriptionId -sourceLocation `$sourceLocation -targetLocation `$targetLocation -sourceTenantId `$sourceTenantId -targetTenantId `$targetTenantId -resourceType `$resourceType -parallel `$parallel"


