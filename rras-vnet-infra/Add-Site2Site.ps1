param
    (
        [Parameter(Mandatory=$true,Position=1)]
        [String] $TargetRRASIP,
        [Parameter(Mandatory=$true,Position=2)]
        [String] $TargetIPRange,
        [Parameter(Mandatory=$true,Position=3)]     
        [String] $SharedSecret
    )

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
        Write-verbose 'Start RemoateAccess Service '
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

$existing = get-VpnS2SInterface | where {$_.name -eq $S2SName}
if ($existing.name -eq $S2SName)
{
    Write-verbose "Existing Tunnel $S2SName Found, Deleting..."
    disconnect-VpnS2SInterface -Name $S2SName -Confirm:$false -Force -Verbose
    remove-VpnS2SInterface -Name $S2SName -Confirm:$false -Force -Verbose
}

Write-verbose "Configuring Tunnel $S2SName"
try 
{
    Add-VpnS2SInterface -Name $S2SName $TargetRRASIP -Protocol IKEv2 -AuthenticationMethod PSKOnly -SharedSecret $SharedSecret -IPv4Subnet $TargetIPRangeMetric -persistent -AutoConnectEnabled $true -Verbose
    Set-VpnS2SInterface -Name $S2SName  -InitiateConfigPayload $false -Verbose
    start-sleep 5
    $result = get-VpnS2SInterface -name $S2SName -Verbose
    Write-verbose "Tunnel Created, Status: $($result.ConnectionState)"
}
catch
{

}
Finally
{
    start-sleep 60
    $result = get-VpnS2SInterface -name $S2SName -Verbose
    write-verbose "Tunnel Status: $($result.ConnectionState)"
}




