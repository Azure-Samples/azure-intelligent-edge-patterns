[cmdletbinding(DefaultParameterSetName='iSCSIDisk')]
param
(
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $RemoteServer = "fileservices",
        [Parameter(ParameterSetName='iSCSIDisk')]
        [Array]
        $RemoteServerIPs = @("1.1.1.1","1.1.1.2"),
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $DiskFolder = 'C:\iscsishare',    
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $DiskName= "DiskName",
        [Parameter(ParameterSetName='iSCSIDisk')]
        $DiskSize =  10GB,   
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $TargetName = "RemoteTarget01"
)

$VerbosePreference="silentlycontinueshare "
Import-Module ServerManager
Import-Module MPIO
Import-Module IscsiTarget
$VerbosePreference="continue"

$ParamSetName = $PSCmdlet.ParameterSetName
Write-verbose "Creating iSCSI storage with '$ParamSetName'"

Write-verbose "Checking iSCSI File Server Installation"
$Installation = get-windowsfeature FS-iSCSITarget-server -Verbose
if ($Installation.Installed)
{
    Write-verbose "iSCSI File Server Already Installed"
}
else
{
    Write-verbose 'Installing iSCSI File Server'
    install-windowsfeature FS-iSCSITarget-server -IncludeManagementTools -Confirm:$false 
    start-sleep 10

    $WinTarget = get-service -name MSiSCSI
    do {
        $WinTarget = get-service -name MSiSCSI
        Write-verbose 'Set Automatic Start for WinTarget'
        Set-Service -Name "WinTarget" -StartupType Automatic -Confirm:$false -Verbose
        Write-verbose 'Start WinTarget Service'
        Start-Service -Name "WinTarget" -Confirm:$false -Verbose
        start-sleep 3
    } while ($WinTarget.status -ne 'Running')
}


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



$IPTargets = $RemoteServerIPs | % {"IPAddress:" + $_} 
$iqnprefix = "iqn:iqn.1991-05.com.microsoft:"
$IDs = $iqnprefix +  $RemoteServer

$RemoteInitiators = @()
$RemoteInitiators += $IDs 
$RemoteInitiators += $IPTargets 

$ExistingTarget = get-iscsiservertarget | ? {$_.TargetName -eq $TargetName}
if ($ExistingTarget -eq $null){
    
    new-iscsiservertarget -targetname $TargetName -InitiatorIds $RemoteInitiators
}


write-verbose "Checking for $DiskFolder"
if (!(Test-Path $DiskFolder))
{
    write-verbose "Creating $DiskFolder"
    New-Item -ItemType Directory -Path $DiskFolder
}
else
{
    write-verbose "$DiskFolder Exists"
}

$VirtualDisk = Join-Path $DiskFolder "$DiskName.vhdx"
$Existing = get-IscsiVirtualDisk | ? {$_.path -eq $virtualdisk }
if (!($Existing ))
{
    Write-verbose "Creating new disk $($VirtualDisk)"
    New-IscsiVirtualDisk -Path $VirtualDisk -SizeBytes $DiskSize
}
else
{
    Write-verbose "Disk $($VirtualDisk) already exists "
}

Add-IscsiVirtualDiskTargetMapping -TargetName $TargetName  -Path $VirtualDisk
Set-IscsiServerTarget -TargetName $TargetName
    


<#

remove-iscsiservertarget -TargetName $TargetName 
new-iscsiservertarget -targetname $iSCSITargetName  -InitiatorIds  $IDs

# -EnableChap $True -Chap (New-Object PSCredential("username", (ConvertTo-SecureString -AsPlainText "UserP@ssw0rd01" -Force))) -PassThru 

$results = Get-IscsiServerTarget -TargetName $iSCSITargetName

$results
$results.TargetIqn

#>