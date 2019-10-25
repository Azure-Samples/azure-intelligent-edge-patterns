#NOTE:  Values below are examples and will not actually work.  Replace with real values from Azure network for your subscription.

Configuration AzureS2S
{
    Import-DscResource -ModuleName 'xRemoteAccess','PSDesiredStateConfiguration'
    Node $AllNodes.where{$_.Role -eq 'LocalNetworkS2SGateway'}.NodeName
    {
        LocalConfigurationManager        {            RebootNodeIfNeeded = $true        }
        WindowsFeature Routing
        {
            Ensure = 'Present'
            Name = 'Routing'

        }
        WindowsFeature RemoteAccessPowerShell
        {
            Ensure = 'Present'
            Name = 'RSAT-RemoteAccess-PowerShell'
            DependsOn = '[WindowsFeature]Routing'
        }
        Service RemoteAccess
        {
            Ensure = 'Present'
            Name = 'RemoteAccess'
            State = 'Running'
            DependsOn = '[WindowsFeature]Routing'
        }
        RemoteAccess VpnS2S
        {
            Ensure = 'Present'
            VpnType = 'VpnS2S'
            DependsOn = '[WindowsFeature]Routing'
        }
        VpnS2SInterface IKEv2
        {
            Ensure = 'Present'
            Protocol = 'IKEv2'
            AuthenticationMethod = 'PSKOnly'
            NumberOfTries = 3
            ResponderAuthenticationMethod = 'PSKOnly'
            Name = $node.AzureNetworkIP
            Destination = $node.AzureNetworkIP
            IPv4Subnet = $node.AzureIPv4Subnet
            SharedSecret = $node.AzureNetworkSharedSecret
            InitiateConfigPayload = $false
            DependsOn = '[RemoteAccess]VpnS2S'
        }
        VpnServerIPsecConfiguration MaximumEncryption
        {
            EncryptionType = 'MaximumEncryption'
            DependsOn = '[VpnS2SInterface]IKEv2'
        }
        VpnS2SInterfaceConnection Connect
        {
            Ensure = 'Present'
            Name = $node.AzureNetworkIP
            DependsOn = '[VpnServerIPsecConfiguration]MaximumEncryption'
        }
    }
}

$outPath = 'c:\DSC\AzureS2S'

AzureS2S -configurationdata ConfigurationData.psd1 -out $outPath
Set-DscLocalConfigurationManager -Path $outPath -Verbose
Start-DscConfiguration -Wait -Path $outPath -Verbose