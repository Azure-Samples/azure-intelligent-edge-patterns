param(
    $TargetPortalAddresses = @("1.1.1.1"),
    $LocaliSCSIAddresses = @("10.10.1.4"),
    $LoadBalancePolicy = "RR"
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



Foreach ($TargetPortalAddress in $TargetPortalAddresses){
    New-IscsiTargetPortal -TargetPortalAddress $TargetPortalAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocaliSCSIAddress
}

 
Foreach ($TargetPortalAddress in $TargetPortalAddresses){
    write-verbose "connecting to iSCSI Target $TargetPortalAddress from $LocaliSCSIAddress "
    Get-IscsiTarget | Connect-IscsiTarget -IsMultipathEnabled $true -TargetPortalAddress $TargetPortalAddress -InitiatorPortalAddress $LocaliSCSIAddress -IsPersistent $true
}

write-verbose "Register iSCSI sessions"
Get-IscsiSession | Register-IscsiSession

<#
switch  ($LoadBalancePolicy) 
{
    "FOO" {write-verbose "Load Balance Policy Set to 'FOO' Fail Over Only."}
    "RR" {write-verbose "Load Balance Policy Set to 'RR' Round Robin."}
    "LQD" {write-verbose "Load Balance Policy Set to 'LQD' Least Queue Depth."}
    "LB" {write-verbose "Load Balance Policy Set to 'LB' Least Blocks."}
}
Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy $LoadBalancePolicy
#>



$RawDisks = @(Get-iSCSISession | Get-Disk | Where partitionstyle -eq "raw" | select -Unique Number).number

write-verbose "$($rawdisks).count raw disks found"

foreach ($RawDisk in $RawDisks)
{
    write-verbose "set isOffline to false"
    Set-Disk -Number $RawDisk -IsOffline $false 
    write-verbose "Read only disk set to false"
    Set-Disk -Number $RawDisk -IsReadOnly $false
    write-verbose "Initializing disk $rawdisk"
    $result = Get-Disk -Number $RawDisk | Initialize-Disk -PartitionStyle MBR -PassThru |    New-Partition -AssignDriveLetter -UseMaximumSize |  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Disk$RawDisk" -Confirm:$false
    write-verbose "Drive Letter $($result.DriveLetter)"
    write-verbose "Drive Size $($result.Size/1gb)"
}


 
Get-IscsiConnection
Get-IscsiSession
