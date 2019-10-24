<#
    None = Clears any currently configured default load balance policy.
    FOO = Fail Over Only.
    RR = Round Robin.
    LQD = Least Queue Depth.
    LB = Least Blocks.
#>


$VerbosePreference="silentlycontinue"
Import-Module ServerManager
Import-Module Storage
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

$VerbosePreference="silentlycontinue"
Import-Module MPIO
$VerbosePreference="continue"

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

write-host "Please remember to reboot to ensure the MPIO load balancing policy can be set correctly in the final step"
<#
Foreach ($TargetPortalAddress in $TargetPortalAddresses)
{
    foreach ($LocaliSCSIAddress in $LocaliSCSIAddresses)
    {
        New-IscsiTargetPortal -TargetPortalAddress $TargetPortalAddress -TargetPortalPortNumber 3260 -InitiatorPortalAddress $LocaliSCSIAddress
    }
}
#>
