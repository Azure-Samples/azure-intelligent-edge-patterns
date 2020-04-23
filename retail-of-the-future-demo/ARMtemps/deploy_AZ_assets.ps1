if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
    Install-Module -Name Az.Accounts -AllowClobber -Scope CurrentUser   
}
if (-not (Get-Module -ListAvailable -Name Az.Resources)) {
    Install-Module -Name Az.ResourceGroup -AllowClobber -Scope CurrentUser   
}
Connect-AzAccount
$RGname = Read-Host -Prompt 'ResourceGroup name'
New-AzResourceGroup -Name $RGname -location westus 
New-AzResourceGroupDeployment -ResourceGroupName $RGname -TemplateFile .\arm_template.json 