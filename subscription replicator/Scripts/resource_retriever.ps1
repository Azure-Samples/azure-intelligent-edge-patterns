#

param(

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
    [ValidateSet(
        'All',
        'Microsoft.Compute/availabilitySets',
        'Microsoft.Compute/virtualMachines',
        'Microsoft.Network/loadBalancers',
        'Microsoft.Network/networkSecurityGroups',
        'Microsoft.Network/publicIPAddresses',
        'Microsoft.Network/routeTables',
        'Microsoft.Network/virtualNetworks',
        'Microsoft.Network/virtualNetworkGateways',
        'Microsoft.Storage/storageAccounts'
    )]
    [String]$resourceType,

    [Parameter(Mandatory=$true)]
    [bool]$parallel
)

#create the folders where the generated files will be stored
if(!(Test-Path "Parameter_Files")){
    New-Item -Path . -Name "Parameter_Files" -ItemType "directory"
    New-Item -Path . -Name "Deployment_Files" -ItemType "directory"

    New-Item -Path "$pwd\..\Standardized_ARM_Templates\" -Name "Custom_ARM_Templates" -ItemType "directory"
    
    #generate the deployment files
    
    New-Item -Path .\Deployment_Files -Name "DeployResources.ps1" -ItemType "file"
    New-Item -Path .\Deployment_Files -Name "DeployResourceGroups.ps1" -ItemType "file"
    
    $setContextBlock = 
@"
Set-AzureRmContext -SubscriptionId $targetSubscriptionId -ErrorAction Stop`n
"@
    Add-Content -Path ".\Deployment_Files\DeployResourceGroups.ps1" -Value $setContextBlock

    $requiredParameters = 
@"
param(
    [Parameter(Mandatory=`$true)]
    [Security.SecureString]`$vmAdminPassword
)`n
"@
    if($resourceType -eq "Microsoft.Compute/virtualMachines" -or $resourceType -eq "All"){
        Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value $requiredParameters
    }
}

Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value $setContextBlock

#set context to source subscription 
Set-AzureRmContext -SubscriptionId $sourceSubscriptionId

#get the resources in the source subscription
$resourceTypes = @(
    'Microsoft.Network/virtualNetworks',
    'Microsoft.Network/routeTables',
    'Microsoft.Network/networkSecurityGroups',
    'Microsoft.Network/publicIPAddresses',
    'Microsoft.Network/virtualNetworkGateways',
    'Microsoft.Network/loadBalancers',
    'Microsoft.Compute/availabilitySets',
    'Microsoft.Storage/storageAccounts',
    'Microsoft.Compute/virtualMachines'
)

if($resourceType -eq "All"){
    $resources = @()
    foreach($rt in $resourceTypes){
        # Check if resource type is Microsoft.Network/networkSecurityGroups. Use specific API version: 2017-10-01
        # The API discovery (via Get-AzureRmResource) chooses the API version: 2016-09-01 by default
        # The response with this API version is missing data shown below:
        <# 
        Example missing data:
        "destinationPortRanges": [
            "80",
            "443",
            "6060",
            "8080"
          ],
          "sourceAddressPrefixes": [
            "10.192.1.0/27",
            "10.203.0.0/16"
          ],
        #>
        # To fix this, we use the API version 2017-10-01 which is used by Get-AzureRmNetworkSecurityGroup
        if($rt -eq "Microsoft.Network/networkSecurityGroups"){
            $resources += Get-AzureRmResource -ResourceType $rt -ApiVersion "2017-10-01"
        }
        else{
            $resources += Get-AzureRmResource -ResourceType $rt 
        }
    }
}
else{
    if($rt -eq "Microsoft.Network/networkSecurityGroups"){
        $resources += Get-AzureRmResource -ResourceType $rt -ApiVersion "2017-10-01"
    }
    else{
        $resources = Get-AzureRmResource -ResourceType $resourceType
    }
}

$waitBlock = 
@"
Get-Job | Wait-Job
Get-Job | Receive-Job
Get-Job | Remove-Job`n
"@

$indexCount = 0

Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value "Write-Output ""Deploying $($resources[0].ResourceType)``n""`n"

foreach($resource in $resources){
    #convert resource to a JSON string
    # Check if resource type is Microsoft.Network/networkSecurityGroups. Use specific API version: 2017-10-01
    # The API discovery (via Get-AzureRmResource) chooses the API version: 2016-09-01 by default
    # The response with this API version is missing data. See example above
    # To fix this, we use the API version 2017-10-01 which is used by Get-AzureRmNetworkSecurityGroup
    if($resource.ResourceType -eq "Microsoft.Network/networkSecurityGroups"){
        $resource = Get-AzureRmResource -ResourceId $resource.ResourceId -ApiVersion "2017-10-01"
    }
    else{
        $resource = Get-AzureRmResource -ResourceId $resource.ResourceId
    }
    $resourceJSONString = $resource | ConvertTo-Json -Depth 7

    .\resource_processor.ps1 -resourceJSONString $resourceJSONString `
                             -sourceSubscriptionId $sourceSubscriptionId `
                             -targetSubscriptionId $targetSubscriptionId `
                             -sourceLocation $sourceLocation `
                             -targetLocation $targetLocation `
                             -sourceTenantId $sourceTenantId `
                             -targetTenantId $targetTenantId `
                             -resourceType $resourceType `
                             -parallel $parallel

    if($parallel -eq $true){
        if($indexCount -lt $resources.length - 1){
            if($resources[$indexCount].ResourceType -ne $resources[$indexCount + 1].ResourceType){
                Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value $waitBlock
            }
        }
        else{
            Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value $waitBlock
        }
    }

    if($indexCount -lt $resources.length - 1){
        if($resources[$indexCount].ResourceType -ne $resources[$indexCount + 1].ResourceType){
            Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value "Write-Output ""Deploying $($resources[$indexCount + 1].ResourceType)``n""`n"
        }
    }

    $indexCount++
}
Write-Output "`nScript execution complete."