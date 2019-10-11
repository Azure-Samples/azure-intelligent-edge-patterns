param
    (
        [Parameter(Mandatory=$true,Position=1)]
        [String] $TargetRRASIP,
        [Parameter(Mandatory=$true,Position=2)]
        [String] $TargetIPRange,
        [Parameter(Mandatory=$true,Position=3)]     
        [String] $SourceRRASIP
    )

Import-Module remoteaccess
$VerbosePreference="continue"

$S2SName = ($TargetIPRange.Replace('.','')).Replace('/','')
Write-verbose "Creating Tunnel called $S2SName"

$TargetIPRangeMetric = $TargetIPRange + ':100'

Write-verbose "Tunnel EndPoint: $TargetRRASIP"
Write-verbose "Subnet and Metric in Tunnel: $TargetIPRangeMetric"

Write-verbose "Checking Routing Installation"
$RoutingInstallation = get-windowsfeature routing -Verbose
if ($RoutingInstallation.Installed)
{
    Write-verbose "Routing Already Installed"
}
else
{
    Write-verbose 'Installing Routing'
    Install-WindowsFeature Routing -IncludeManagementTools -Confirm:$false 
    start-sleep 10
    $RAService = get-service -name remoteaccess
    do {
        $RAService = get-service -name remoteaccess
        Write-verbose 'Set Automatic Start for RemoateAccess'
        Set-Service -Name "remoteaccess" -StartupType Automatic -Confirm:$false -Verbose
        Write-verbose 'Start RemoteAccess Service '
        Start-Service -Name "remoteaccess" -Confirm:$false -Verbose
        start-sleep 10
    } while ($RAService.status -ne 'Running')
}


$RRASInstalled = (Get-RemoteAccess).VpnS2SStatus
if ($RRASInstalled -ne 'Installed')
{
    write-verbose 'Installing VpnS2S'
    Install-RemoteAccess -VpnType VpnS2S
    start-sleep 10
}
else
{
    write-verbose 'VpnS2S Installed'
}

$exsiting = get-VpnS2SInterface | where-object {$_.name -eq $S2SName}
if ($exsiting.name -eq $S2SName)
{
    Write-verbose "Existing Tunnel $S2SName Found, Deleting..."
    disconnect-VpnS2SInterface -Name $S2SName -Confirm:$false -Force -Verbose
    remove-VpnS2SInterface -Name $S2SName -Confirm:$false -Force -Verbose
}
try 
{
    Write-verbose "Configuring Tunnel $S2SName"
    Add-VpnS2SInterface -Name $S2SName -GreTunnel -SourceIpAddress $SourceRRASIP -Destination $TargetRRASIP -IPv4Subnet $TargetIPRangeMetric -PassThru -verbose
    start-sleep 5
    $result = get-VpnS2SInterface -name $S2SName -Verbose
    Write-verbose "Tunnel Created, Status: $($result.ConnectionState)"
}
catch
{
    write-host $error
    write-host $error[0].Exception
    write-error "An error has occurred creating the S2S interface"
}
Finally
{
    write-host "Finally block"
    start-sleep 60
    $result = get-VpnS2SInterface -name $S2SName -Verbose
    write-verbose "Tunnel Status: $($result.ConnectionState)"
}




