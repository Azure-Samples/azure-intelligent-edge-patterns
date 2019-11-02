#

param(    
    [Parameter(Mandatory=$true)]
    [String]$parametersFile,

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

    [Parameter(Mandatory=$false)]
    [String]$additionalDeployParams,
    
    [Parameter(Mandatory=$true)]
    [String]$resourceType,

    [Parameter(Mandatory=$true)]
    [bool]$parallel
)

$customTypes = @("virtualMachines", "loadBalancers", "publicIPAddresses", "storageAccounts", "virtualNetworkGateways")

$resourceName = $resourceJSON.Name
$resourceTypeBase = $resourceJSON.Type.Substring($resourceJSON.Type.LastIndexOf("/") + 1)


#update location and subscription IDs in the parameters template

if($parametersFile -like "*$sourceSubscriptionId*"){
    $parametersFile = $parametersFile.replace("$sourceSubscriptionId", "$targetSubscriptionId")
}
if($parametersFile -like "*$sourceLocation*"){
    $parametersFile = $parametersFile.replace("$sourceLocation", "$targetLocation")
}
if($parametersFile -like "*$sourceTenantId*"){
    $parametersFile = $parametersFile.replace("$sourceTenantId", "$targetTenantId")
}

#output parameters template to new file in Parameters_Files folder

$parametersFile | Out-File -FilePath "Parameter_Files\$($resourceTypeBase)_$($resourceName)_Parameters_$($resourceJSON.ResourceGroupName).json"

#create deployment code to deploy the corresponding ARM template with the newly created parameters file

if($customTypes.Contains($resourceTypeBase)){
    $deployResource = 
@"
Write-Output "Deploying $($resourceTypeBase.Substring(0, $resourceTypeBase.Length - 1)) ""$resourceName"" to RG ""$($resourceJSON.ResourceGroupName)"""
New-AzureRmResourceGroupDeployment  -Name "$($resourceName)_$($resourceJSON.ResourceGroupName)" ``
                                    -ResourceGroupName $($resourceJSON.ResourceGroupName) ``
                                    -TemplateFile "`$pwd\..\..\Standardized_ARM_Templates\Custom_ARM_Templates\$($resourceTypeBase)_$($resourceName)_ARM_Template_$($resourceJSON.ResourceGroupName).json" ``
                                    -TemplateParameterFile "`$pwd\..\Parameter_Files\$($resourceTypeBase)_$($resourceName)_Parameters_$($resourceJSON.ResourceGroupName).json" ``
                                    -Mode Incremental $additionalDeployParams
"@
}
else{
    $deployResource = 
@"
Write-Output "Deploying $($resourceTypeBase.Substring(0, $resourceTypeBase.Length - 1)) ""$resourceName"" to RG ""$($resourceJSON.ResourceGroupName)"""
New-AzureRmResourceGroupDeployment  -Name "$($resourceName)_$($resourceJSON.ResourceGroupName)" ``
                                    -ResourceGroupName $($resourceJSON.ResourceGroupName) ``
                                    -TemplateFile "`$pwd\..\..\Standardized_ARM_Templates\$($resourceTypeBase)_ARM_Template.json" ``
                                    -TemplateParameterFile "`$pwd\..\Parameter_Files\$($resourceTypeBase)_$($resourceName)_Parameters_$($resourceJSON.ResourceGroupName).json" ``
                                    -Mode Incremental $additionalDeployParams
"@
}
if($parallel -eq $true){
    $deployResource += 
@"
``
                                    -AsJob`n
"@
}
else{
    $deployResource += "`n"
}

#add deployment code to DeployResources.ps1
Add-Content -Path ".\Deployment_Files\DeployResources.ps1" -Value $deployResource

#create deployment code to deploy the resource group and add it to DeployResourceGroups.ps1 if that deployment code
#is not already in there
if(!((Get-Content -Path ".\Deployment_Files\DeployResourceGroups.ps1") -like "*$($resourceJSON.ResourceGroupName)*")){

    $deployResourceGroup = 
@"
New-AzureRmResourceGroup -Name $($resourceJSON.ResourceGroupName) -Location $targetLocation
"@

    Add-Content -Path ".\Deployment_Files\DeployResourceGroups.ps1" -Value $deployResourceGroup
}