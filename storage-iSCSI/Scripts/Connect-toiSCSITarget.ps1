param(
    $TargetPortalAddresses = @("172.20.14.64","172.20.14.79"),
    $LocaliSCSIAddresses = @("10.10.0.4","10.10.0.5"),
    $LoadBalancePolicy = "LQD"
)


$VerbosePreference="silentlycontinue"
Import-Module ServerManager
Import-Module MPIO
Import-Module IscsiTarget
$VerbosePreference="continue"



Foreach ($TargetPortalAddress in $TargetPortalAddresses){
    New-IscsiTargetPortal -TargetPortalAddress $TargetPortalAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocaliSCSIAddress
}

 
Foreach ($TargetPortalAddress in $TargetPortalAddresses){
    Get-IscsiTarget | Connect-IscsiTarget -IsMultipathEnabled $true -TargetPortalAddress $TargetPortalAddress -InitiatorPortalAddress $LocaliSCSIAddress -IsPersistent $true
}

switch  ($LoadBalancePolicy) 
{
    "FOO" {write-verbose "Load Balance Policy Set to 'FOO' Fail Over Only."}
    "RR" {write-verbose "Load Balance Policy Set to 'RR' Round Robin."}
    "LQD" {write-verbose "Load Balance Policy Set to 'LQD' Least Queue Depth."}
    "LB" {write-verbose "Load Balance Policy Set to 'LB' Least Blocks."}
}


Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy $LoadBalancePolicy

Get-IscsiConnection