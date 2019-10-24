[cmdletbinding(DefaultParameterSetName='iSCSIDisk')]
param
(
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $RemoteServer = "FileServer",
        [Parameter(ParameterSetName='iSCSIDisk')]
        [Array]
        $RemoteServerIPs = @("1.1.1.1"),
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $DiskFolder = 'C:\iSCSIVirtualDisks',    
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $DiskName= "DiskName",
        [Parameter(ParameterSetName='iSCSIDisk')]
        $DiskSize =  5GB,   
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $TargetName = "RemoteTarget01",
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $ChapUsername = "username",
        [Parameter(ParameterSetName='iSCSIDisk')]
        [String]
        $ChapPassword = "userP@ssw0rd!"
)


if ($ChapPassword.Length -ge 12 -and $ChapPassword.Length -lt 16)
{
    Write-Verbose "Chap password is a valid length"
}
else
{
    write-error "The length of CHAP or reverse CHAP secret must be at least 12 characters, but no more than 16 characters."
    exit
}
$ChapAuth = New-Object System.Management.Automation.PSCredential($ChapUsername,$ChapPassword)


$VerbosePreference="silentlycontinue"
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

    $WinTarget = get-service -name WinTarget
    while ($WinTarget.status -ne 'Running')
    {
        $WinTarget = get-service -name WinTarget
        Write-verbose 'Set Automatic Start for WinTarget'
        Set-Service -Name "WinTarget" -StartupType Automatic -Confirm:$false -Verbose
        Write-verbose 'Start WinTarget Service'
        Start-Service -Name "WinTarget" -Confirm:$false -Verbose
        start-sleep 3
    } 
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
while ($MSiSCSI.status -ne 'Running')
{
    Write-verbose 'Set Automatic Start for MSiSCSI'
    Set-Service -Name "MSiSCSI" -StartupType Automatic -Confirm:$false -Verbose
    Write-verbose 'Start MSiSCSI Service'
    Start-Service -Name "MSiSCSI" -Confirm:$false -Verbose
    start-sleep 3
    $MSiSCSI = get-service -name MSiSCSI
}



$IPTargets = $RemoteServerIPs | % {"IPAddress:" + $_} 
$iqnprefix = "iqn:iqn.1991-05.com.microsoft:"
$ID = $iqnprefix +  $RemoteServer.ToLower()

$RemoteInitiators = @()
$RemoteInitiators += $ID
$RemoteInitiators += $IPTargets 

$ExistingTarget = get-iscsiservertarget | ? {$_.TargetName -eq $TargetName}
if ($ExistingTarget -eq $null){
    write-verbose "iSCSI target not found. Creating $TargetName"
    new-iscsiservertarget -targetname $TargetName -InitiatorIds $RemoteInitiators
}
else
{
    write-verbose "iSCSI target $TargetName found."
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


Add-IscsiVirtualDiskTargetMapping -TargetName $TargetName -Path $VirtualDisk


Set-IscsiServerTarget -TargetName $TargetName -EnableChap $true -Chap $ChapAuth


$StorageIPs = (Get-NetIPAddress |? {$_.addressfamily -eq 'IPv4' -and $_.ipaddress -ne '127.0.0.1'}).IPAddress

#get-IscsiServerTarget

<#

remove-iscsiservertarget -TargetName $TargetName 


new-iscsiservertarget -targetname $iSCSITargetName  -InitiatorIds  $IDs


 # -EnableChap $True -Chap (New-Object PSCredential("username", (ConvertTo-SecureString -AsPlainText "UserP@ssw0rd01" -Force))) -PassThru 


$results = Get-IscsiServerTarget -TargetName $iSCSITargetName

$results
$results.TargetIqn

#>