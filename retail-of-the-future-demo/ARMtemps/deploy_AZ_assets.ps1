if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
    Install-Module -Name Az.Accounts -AllowClobber -Scope CurrentUser   
}
if (-not (Get-Module -ListAvailable -Name Az.Resources)) {
    Install-Module -Name Az.ResourceGroup -AllowClobber -Scope CurrentUser   
}
Connect-AzAccount
$RGname = Read-Host -Prompt 'ResourceGroup name'
$rgRegion = Read-Host -Prompt 'ResourceGroup location'
New-AzResourceGroup -Name $RGname -location $rgRegion 
New-AzResourceGroupDeployment -ResourceGroupName $RGname -TemplateFile .\arm_template.json 