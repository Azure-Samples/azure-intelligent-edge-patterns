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
Import-Module IscsiTarget
$VerbosePreference="continue"

Write-verbose "Checking Multipath-IO Installation"
$Installation = get-windowsfeature Multipath-IO -Verbose
if ($Installation.Installed)
{
    Write-verbose "MultiPath-IO Already Installed"
}
else
{
    Write-verbose 'Installing MultiPath-IO'
    Enable-WindowsOptionalFeature -Online -FeatureName MultipathIO 
}

$MSiSCSI = get-service -name MSiSCSI
do {
    $MSiSCSI = get-service -name MSiSCSI
    Write-verbose 'Set Automatic Start for MSiSCSI'
    Set-Service -Name "MSiSCSI" -StartupType Automatic -Confirm:$false -Verbose
    Write-verbose 'Start MSiSCSI Service'
    Start-Service -Name "MSiSCSI" -Confirm:$false -Verbose
    start-sleep 3
} while ($MSiSCSI.status -ne 'Running')


write-verbose "Get Initiator Address"
$InitiatorAddress = (get-initiatorport).nodeaddress
write-verbose "Initiator Address: $InitiatorAddress"

write-verbose "Add Support for multipath MPIO to iSCSI"
New-MSDSMSupportedHW -VendorId MSFT2005 -ProductId iSCSIBusType_0x9


Write-Verbose "Enable automatic claiming of all iSCSI volumes"
Enable-MSDSMAutomaticClaim -BusType iscsi

Write-Verbose "Set the disk timeout to 60 seconds"
Set-MPIOSetting -NewDiskTimeout 60

<#
Foreach ($TargetPortalAddress in $TargetPortalAddresses)
{
    foreach ($LocaliSCSIAddress in $LocaliSCSIAddresses)
    {
        New-IscsiTargetPortal -TargetPortalAddress $TargetPortalAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocaliSCSIAddress
    }
}
#>

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
