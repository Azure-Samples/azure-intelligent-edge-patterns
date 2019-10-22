param(
    $TargetPortalAddresses = @("172.20.14.64","172.20.14.79"),
    $LocaliSCSIAddresses = @("10.10.0.4","10.10.0.5"),
    $LoadBalancePolicy = "LQD"
)

<#
    None = Clears any currently configured default load balance policy.
    FOO = Fail Over Only.
    RR = Round Robin.
    LQD = Least Queue Depth.
    LB = Least Blocks.
#>


$VerbosePreference="silentlycontinue"
Import-Module ServerManager
Import-Module MPIO
Import-Module Storage
Import-Module IscsiTarget
$VerbosePreference="continue"



Foreach ($TargetPortalAddress in $TargetPortalAddresses)
{
    foreach ($LocaliSCSIAddress in $LocaliSCSIAddresses)
    {
        New-IscsiTargetPortal -TargetPortalAddress $TargetPortalAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocaliSCSIAddress -ErrorAction SilentlyContinue
    }
}


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

Get-IscsiSession | Register-IscsiSession
Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy $LoadBalancePolicy

$RawDisks = @(Get-iSCSISession | Get-Disk | Where partitionstyle -eq ‘raw’ | select -Unique Number).number

foreach ($RawDisk in $RawDisks)
{
    Get-Disk -Number $RawDisk | Initialize-Disk -PartitionStyle MBR -PassThru |    New-Partition -AssignDriveLetter -UseMaximumSize |  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Disk$RawDisk" -Confirm:$false
}

 
Get-IscsiConnection
Get-IscsiSession
