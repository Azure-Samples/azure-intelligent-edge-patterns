Import-Module remoteaccess
$VerbosePreference="continue"
$S2SInterfaces = @(Get-VpnS2SInterface)
if ($S2SInterfaces.count -eq 0)
{
    write-verbose "No VPN S2S interfaces found on $($env:computername)"
    exit
}
else
{
     write-verbose "$($S2SInterfaces.count) VPN S2S interfaces found on $($env:computername)"
}

Foreach ($tunnel in $S2SInterfaces)
{
    Write-Verbose "Details for $($tunnel.Name), ConnectionState: $($tunnel.ConnectionState), Destination: $($tunnel.Destination), IPv4Subnet: $($tunnel.IPv4Subnet)"

}
