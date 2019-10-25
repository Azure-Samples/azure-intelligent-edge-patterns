[cmdletbinding()]
param(
    [Parameter()]
    [Array]
    $TargetiSCSIAddresses = @("2.2.2.2","2.2.2.3"),
    [Parameter()]
    [Array]
    $LocalIPAddresses = @("10.10.1.4"),
    [Parameter()]
    [String]
    $LoadBalancePolicy = 'LQD',
    [Parameter()]
    [String]
    $ChapUsername = "username",
    [Parameter()]
    [String]
    $ChapPassword = "userP@ssw0rd!"
)

<#
    None = Clears any currently configured default load balance policy.
    FOO = Fail Over Only.
    RR = Round Robin.
    LQD = Least Queue Depth.
    LB = Least Blocks.
#>

if ($ChapPassword.Length -ge 12 -and $ChapPassword.Length -lt 16)
{
    Write-Verbose "Chap password is a valid length"
}
else
{
    write-error "The length of CHAP or reverse CHAP secret must be at least 12 characters, but no more than 16 characters."
    exit
}

$VerbosePreference="silentlycontinue"
Import-Module ServerManager
Import-Module MPIO
Import-Module Storage
Import-Module IscsiTarget
$VerbosePreference="continue"

Write-Verbose "Creating iSCSI target Portals"
write-verbose "$($TargetiSCSIAddresses.count) target iSCSI addresses found"
write-verbose "$($LocalIPAddresses.count) source iSCSI addresses found"
Foreach ($TargetiSCSIAddress in $TargetiSCSIAddresses)
{
    foreach ($LocalIPAddress in $LocalIPAddresses)
    {
        write-verbose "mapping target from $TargetiSCSIAddress via port 3260 to $LocaliSCSIAddress"
        New-IscsiTargetPortal -TargetPortalAddress $TargetiSCSIAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocalIPAddress
    }
}

$iSCSITargets = @(Get-IscsiTarget | where {$_.IsConnected -ne 'True'})
foreach ($iSCSITarget in $iSCSITargets)
{
    Foreach ($TargetiSCSIAddress in $TargetiSCSIAddresses){
        foreach ($LocalIPAddress in $LocalIPAddresses)
        {
            write-verbose "connecting to iSCSI Target $TargetiSCSIAddress from $LocalIPAddress "
            $iSCSITarget | Connect-IscsiTarget -IsMultipathEnabled $true -TargetPortalAddress $TargetiSCSIAddress -InitiatorPortalAddress $LocalIPAddress -IsPersistent $true -AuthenticationType ONEWAYCHAP  -ChapUsername $ChapUsername -ChapSecret $ChapPassword  | Register-IscsiSession

        }
    }

}

Write-Verbose "check load balancing policy"
$CurrentPolicy = get-MSDSMGlobalDefaultLoadBalancePolicy
if ($LoadBalancePolicy -ne $CurrentPolicy )
{
    switch  ($LoadBalancePolicy) 
    {
        "FOO" {write-verbose "Load Balance Policy Set to 'FOO' Fail Over Only."}
        "RR" {write-verbose "Load Balance Policy Set to 'RR' Round Robin."}
        "LQD" {write-verbose "Load Balance Policy Set to 'LQD' Least Queue Depth."}
        "LB" {write-verbose "Load Balance Policy Set to 'LB' Least Blocks."}
    }
    Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy $LoadBalancePolicy
}
else
{
    write-verbose "load balancing policy is set to $CurrentPolicy"
}

$RawDisks = @(Get-iSCSISession | Get-Disk | Where partitionstyle -eq "raw" | select -Unique Number).number
write-verbose "$($rawdisks.count) raw disks found"
foreach ($RawDisk in $RawDisks)
{
    write-verbose "set isOffline to false"
    Set-Disk -Number $RawDisk -IsOffline $false 
    write-verbose "Read only disk set to false"
    Set-Disk -Number $RawDisk -IsReadOnly $false
    write-verbose "Initializing disk $rawdisk"
    $result = Get-Disk -Number $RawDisk | Initialize-Disk -PartitionStyle MBR -PassThru | New-Partition -AssignDriveLetter -UseMaximumSize |  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Disk$RawDisk" -Confirm:$false
    write-verbose "Drive Letter $($result.DriveLetter)"
    write-verbose "Drive Size $($result.Size/1gb)"
}

write-verbose "$((Get-IscsiConnection | measure ).count) iSCSI connections found"

