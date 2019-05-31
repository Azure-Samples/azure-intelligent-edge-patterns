function loginAzureStack 
{
<#
.DESCRIPTION
Gets the Login Details of an AzureStack using Service Principal

.EXAMPLE
$loginInfo_HA = loginAzureStack -AzureStackArmEndpoint $AzureStackArmEndpoint_HA -AADTenantName $AADTenantName_HA -AzureStackSubscriptionId $AzureStackSubscriptionId_HA -AzureStackApplicationId $AzureStackApplicationId -AzureStackApplicationSecret $AzureStackApplicationSecret -EnvironmentName "AzureStack_HA"
 
.NOTES
.PARAMETER AzureStackApplicationId
Azure Stack application ID for the Service Principal. Example: 4ca9bdf3-c205-4140-b3c3-dc4e0f1eeb86

.PARAMETER AzureStackApplicationSecret
Azure Stack Application Secret for the Service Principal. Example: e85cDUuLehhso2/QQF1jWu0U1th7SCFGpSotG7TVwp4=

.PARAMETER AzureStackTenantName
Azure Stack Tenant Name. Example: mashybridpartner.onmicrosoft.com

.PARAMETER AzureStackArmEndpoint
AzureStack Tenant Azure Resource Manager Endpoint for HA Site.  Example: https://management.westus.stackpoc.com/

.PARAMETER AzureStackSubscriptionId
AzureStack Subscription Id for Creating resources. Example : 8453ce6f-76f9-44cd-b2c3-933759237bb1

.SYNOPSIS
Gets the Login Details of an AzureStack using Service Principal
#>

[CmdletBinding()]
Param(
    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationId, 

    [Parameter(Mandatory = $true)][System.String]$AzureStackApplicationSecret, 
      
    [Parameter(Mandatory = $true)][System.String]$AADTenantName,
      
    [Parameter(Mandatory = $true)][System.String]$EnvironmentName,

    [Parameter(Mandatory = $true)][System.String]$AzureStackArmEndpoint ,
 
    [Parameter(Mandatory = $true)][System.String]$AzureStackSubscriptionId )

$azureRMEnvironment = Add-AzureRMEnvironment -ArmEndpoint $AzureStackArmEndpoint -Name $EnvironmentName
$ADauth = (Get-AzureRmEnvironment -Name $EnvironmentName ).ActiveDirectoryAuthority
$AuthEndpoint = (Get-AzureRmEnvironment -Name $EnvironmentName).ActiveDirectoryAuthority.TrimEnd('/')
$AzureStackTenantId = (invoke-restmethod "$($AuthEndpoint)/$($AADTenantName)/.well-known/openid-configuration").issuer.TrimEnd('/').Split('/')[-1]
$endpt = "{0}{1}/.well-known/openid-configuration" -f $ADauth, $AADTenantName
$OauthMetadata = (Invoke-WebRequest -UseBasicParsing $endpt).Content | ConvertFrom-Json
$AADid = $OauthMetadata.Issuer.Split('/')[3]

$secureSecret = ($AzureStackApplicationSecret | ConvertTo-SecureString -AsPlainText -Force)
$credential  = New-Object System.Management.Automation.PSCredential($AzureStackApplicationId, $secureSecret);
$loginInfo = Login-AzureRmAccount -ServicePrincipal  -EnvironmentName $EnvironmentName -Credential $credential -Tenant $AzureStackTenantId -SubscriptionId $AzureStackSubscriptionId
return $loginInfo
}