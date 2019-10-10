$modules = 'C:\Program Files\WindowsPowerShell\Modules\'
$modulename = 'xRemoteAccess'
$Description = 'This module is used to configure RRAS settings, with focus on Azure site to site VPN.'

if (!(test-path (join-path $modules $modulename))) {

    $modulefolder = mkdir (join-path $modules $modulename)
    $examplesFolder = mkdir (join-path $moduleFolder 'Examples')
    New-ModuleManifest -Path (join-path $modulefolder "$modulename.psd1") -Guid $([system.guid]::newguid().guid) -Author 'PowerShell DSC' -CompanyName 'Microsoft Corporation' -Copyright '2015' -ModuleVersion '0.1.0.0' -Description $Description -PowerShellVersion '4.0'

    $standard = @{ModuleName = $modulename
                ClassVersion = '0.1.0.0'
                Path = $modules
                }
    
    $Resources = @()
    
    $Resource = @{Name = 'RemoteAccess'; Param = @()}
    $Resource.Param += New-xDscResourceProperty -Name CapacityKbps -Type UInt64 -Attribute Write -Description 'Specifies the bandwidth processing capacity of the gateway in Kbps.'
    $Resource.Param += New-xDscResourceProperty -Name ClientGpoName -Type String -Attribute Write -Description 'Specifies the names of the client GPO. A domain can be one of the domains deployed in the corporate network. If a GPO name is not specified, then by default a GPO with following name is created in the domain of the DA server - DirectAccess Client Settings.'
    #Skipping ComputerName
    $Resource.Param += New-xDscResourceProperty -Name ConnectToAddress -Type String -Attribute Write -Description 'Specifies the DA server or NAT public address to which the clients connect. Specified as a host name or an IPv4 address. If the address is specified, then is must to be public.'
    $Resource.Param += New-xDscResourceProperty -Name DAInstallType -Type String -Attribute Write -ValidateSet 'FullInstall','ManageOut' -Description 'Specifies the configuration in which DA should be installed.'
    $Resource.Param += New-xDscResourceProperty -Name DeployNat -Type Boolean -Attribute Write -Description 'Specifies that DA should be deployed behind a NAT. In a single network adapter configuration scenario the DA server is always deployed behind a NAT and there is no need to specify this parameter.'
    $Resource.Param += New-xDscResourceProperty -Name Ensure -Type String -Attribute Write -ValidateSet 'Present','Absent' -Description 'Governs whether Remote Access should be installed or uninstalled from the server.'
    $Resource.Param += New-xDscResourceProperty -Name EntrypointName -Type String -Attribute Write -Description 'Specifies the identity of a site in a multi-site deployment where VPN needs to be installed.'
    $Resource.Param += New-xDscResourceProperty -Name IPAddressRange -Type String[] -Attribute Write -Description 'Specifies that static pool IPv4 addressing should be enabled. This parameter contains an IP address range, and consisting of a start IP and an end IP, from which IP addresses are allocated to VPN clients. The start and end IPs of each of the ranges must be specified one after the other and separated by commas.'
    $Resource.Param += New-xDscResourceProperty -Name IPv6Prefix -Type String -Attribute Write -Description 'Enables IPv6 address assignment for a VPN and specifies the prefix to use for the addressing.'
    $Resource.Param += New-xDscResourceProperty -Name InternalInterface -Type String -Attribute Write -Description 'Specifies the name of the corporate network facing interface. In a single network adapter configuration the same name is specified for both internal and internet interfaces. If a name is not specified, then the cmdlet attempts to detect the internal interface automatically. '
    $Resource.Param += New-xDscResourceProperty -Name InternetInterface -Type String -Attribute Write -Description 'Specifies the name of the internet facing interface. In a single network adapter configuration the same name is specified for both internal and internet interfaces. If name is not specified, then this cmdlet attempts to detect the internet interface automatically.'
    $Resource.Param += New-xDscResourceProperty -Name MsgAuthenticator -Type String -Attribute Write -ValidateSet 'Enabled','Disabled' -Description 'Specifies that the usage of message authenticator should be enabled or disabled. The default value is Disabled. This parameter is applicable only when a RADIUS server is being configured for authentication.'
    $Resource.Param += New-xDscResourceProperty -Name MultiTenancy -Type Boolean -Attribute Write -Description 'Indicates that multitenancy is enabled for the service.'
    $Resource.Param += New-xDscResourceProperty -Name NlsCertificate -Type String -Attribute Write -Description 'Specifies that the Network Location Server  should be configured on the DA server itself and represents the certificate to be used. The subject name of the certificate should resolve to an address on the internal interface of the DA server.'
    $Resource.Param += New-xDscResourceProperty -Name NlsUrl -Type String -Attribute Write -Description 'Specifies that the NLS is present on a different server and represents the URL on the server that will be used to provide clients with location information.'
    $Resource.Param += New-xDscResourceProperty -Name NoPrerequisite -Type Boolean -Attribute Write -Description 'Specifies that a prerequisite check should not be performed for DA.'
    $Resource.Param += New-xDscResourceProperty -Name RadiusPort -Type UInt16 -Attribute Write -Description 'Specifies the port number on which the RADIUS server is accepting authentication requests. The default value is 1813. This parameter is applicable only when a RADIUS server is being configured for authentication.'
    $Resource.Param += New-xDscResourceProperty -Name RadiusScore -Type Uint16 -Attribute Write -Description 'Specifies the port number on which the RADIUS server is accepting authentication requests. The default value is 1813. This parameter is applicable only when a RADIUS server is being configured for authentication.'
    $Resource.Param += New-xDscResourceProperty -Name RadiusServer -Type String -Attribute Write -Description 'Specifies the IPv4 or IPv6 address, or host name, of the RADIUS server that is to be used for authentication. Specifying this parameter indicates that RADIUS authentication should be used for VPN.'
    $Resource.Param += New-xDscResourceProperty -Name RadiusTimeout -Type UInt32 -Attribute Write -Description 'Specifies the timeout value for the RADIUS server, in seconds. The default value is 5 seconds. This parameter is applicable only when a RADIUS server is being configured for authentication.'
    $Resource.Param += New-xDscResourceProperty -Name ServerGpoName -Type String -Attribute Write -Description 'Specifies the name of the GPO for the DA server. If a name is not specified, then a GPO with the following name DirectAccess Client Settings is created in the domain of a DA server.'
    $Resource.Param += New-xDscResourceProperty -Name SharedSecret -Type String -Attribute Write -Description 'Specifies the shared secret between the RA server and the specified external RADIUS server, which is required for successful communication between the two servers. The secret is specified in plain text. It is mandatory to specify this parameter if a RADIUS server is being configured for authentication.'
    $Resource.Param += New-xDscResourceProperty -Name ThrottleLimit -Type UInt32 -Attribute Write -Description 'Specifies the maximum number of concurrent operations that can be established to run the cmdlet. If this parameter is omitted or a value of 0 is entered, then Windows PowerShell® calculates an optimum throttle limit for the cmdlet based on the number of CIM cmdlets that are running on the computer. The throttle limit applies only to the current cmdlet, not to the session or to the computer.'
    $Resource.Param += New-xDscResourceProperty -Name VpnType -Type String -Attribute Key -ValidateSet 'Vpn','VpnS2S' -Description 'Specifies the type of VPN installation.'
    New-xDscResource -Name MSFT_$($Resource.Name) -Property $Resource.Param -FriendlyName $Resource.Name @standard
    $Resources += $Resource
    
    $Resource = @{Name = 'VpnS2SInterface'; Param = @()}
    $Resource.Param += New-xDscResourceProperty -Name AdminStatus -Type Boolean -Attribute Write -Description 'Specifies the administrator status of the cmdlet.'
    $Resource.Param += New-xDscResourceProperty -Name AuthenticationMethod -Type String -Attribute Write -Description 'Specifies the authentication method to be used by the S2S connection. If PSK is specified, then there can only be one active S2S VPN interface per destination IP address.'
    $Resource.Param += New-xDscResourceProperty -Name AuthenticationTransformConstants -Type String -Attribute Write -ValidateSet 'SHA256128','MD596','SHA196','GCMAES128','GCMAES192','GCMAES256' -Description 'Specifies a transform constant.'
    $Resource.Param += New-xDscResourceProperty -Name Certificate -Type String -Attribute Write -Description 'Specifies the certificate to be used in default store. Applicable only if AuthenticationMethod parameter is set to MachineCert.'
    $Resource.Param += New-xDscResourceProperty -Name CipherTransformConstants -Type String -Attribute Write -ValidateSet 'DES','DES3','AES128','AES192','AES256','GCMAES128','GCMAES192','GCMAES256' -Description 'Specifies a cipher transform constant.'
    $Resource.Param += New-xDscResourceProperty -Name CustomPolicy -Type String -Attribute Write -Description 'Specifies the custom IKE IPsec policies.'
    $Resource.Param += New-xDscResourceProperty -Name DHGroup -Type String -Attribute Write -Description 'Specifies the Diffie-Hellman (DH) group for the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name Destination -Type String -Attribute Write -Description 'Specifies the destination end point of the S2S connection.'
    # Validate Set
    $Resource.Param += New-xDscResourceProperty -Name EapMethod -Type String -Attribute Write -Description 'Specifies the EAP method if IkeLocalAuthenticationMethod is EAP.'
    $Resource.Param += New-xDscResourceProperty -Name EnableQoS -Type Boolean -Attribute Write -Description 'Indicates whether to enable Quality of Service (QoS) on an interface.'
    # Validate Set
    $Resource.Param += New-xDscResourceProperty -Name EncryptionMethod -Type String -Attribute Write -Description 'Specifies the encryption method for the IKE policy.'
    # Validate Set
    $Resource.Param += New-xDscResourceProperty -Name EncryptionType -Type String -Attribute Write -Description 'Specifies the type of encryption.'
    $Resource.Param += New-xDscResourceProperty -Name Ensure -Type String -Attribute Write -ValidateSet 'Present','Absent' -Description 'Governs whether the VPN site to site interface should be present or absent from the server.'
    $Resource.Param += New-xDscResourceProperty -Name IdleDisconnectSeconds -Type UInt32 -Attribute Write -Description 'Specifies the time interval, in seconds, after which an idle connection is disconnected. Unless you disable idle timeout, an idle connection is disconnected after this time interval is reached.'
    $Resource.Param += New-xDscResourceProperty -Name InitiateConfigPayload -Type Boolean -Attribute Write -Description 'Indicates whether to initiate Config payload negotiation.'
    $Resource.Param += New-xDscResourceProperty -Name IPv4Subnet -Type String -Attribute Write -Description 'Specifies the IPv4 subnet that is routed on this connection with metrics. You must specify the IPv4 subnet in the format of IPv4Address/SubnetPrefixLength:RouteMetric.'
    $Resource.Param += New-xDscResourceProperty -Name IPv4TriggerFilter -Type String[] -Attribute Write -Description 'Specifies an array of IPv4 filters that trigger demand dial connections.'
    $Resource.Param += New-xDscResourceProperty -Name IPv4TriggerFilterAction -Type String -Attribute Write -Description 'Indicates whether a filter should trigger an S2S connection.'
    $Resource.Param += New-xDscResourceProperty -Name IPv6Subnet -Type String[] -Attribute Write -Description 'Specifies the IPv6 subnet that is routed on this connection with metrics.'
    $Resource.Param += New-xDscResourceProperty -Name IPv6TriggerFilter -Type String[] -Attribute Write -Description 'Specifies an array of IPv6 filters that trigger demand dial connections.'
    $Resource.Param += New-xDscResourceProperty -Name IPv6TriggerFilterAction -Type String -Attribute Write -Description 'Indicates whether a filter should trigger an S2S connection.'
    $Resource.Param += New-xDscResourceProperty -Name IntegrityCheckMethod -Type String -Attribute Write -Description 'Specifies the integrity method for the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name InternalIPv4 -Type Boolean -Attribute Write -Description 'Specifies that the IPv4 address should be negotiated.'
    $Resource.Param += New-xDscResourceProperty -Name InternalIPv6 -Type Boolean -Attribute Write -Description 'Specifies that the IPv6 address should be negotiated.'
    $Resource.Param += New-xDscResourceProperty -Name Name -Type String -Attribute Key -Description 'Specifies the integrity method for the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name NetworkOutageTimeSeconds -Type UInt32 -Attribute Write -Description 'Specifies the maximum amount of time, in seconds, before a connection is disconnected due to a network outage.'
    $Resource.Param += New-xDscResourceProperty -Name NumberOfTries -Type UInt32 -Attribute Write -Description 'Specifies the number of connection attempts.'
    # Skipping Password
    $Resource.Param += New-xDscResourceProperty -Name Persistent -Type Boolean -Attribute Write -Description 'Indicates that a connection is not disconnected due to inactivity.'
    $Resource.Param += New-xDscResourceProperty -Name PfsGroup -Type String -Attribute Write -Description 'Specifies the PFS group in the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name PostConnectionIPv4Subnet -Type String[] -Attribute Write -Description 'Specifies the IPv4 subnet routes that are added to a site-to-site interface after the connection is established. The values specified are not used to initiate the site-to-site VPN connection.'
    $Resource.Param += New-xDscResourceProperty -Name PostConnectionIPv6Subnet -Type String[] -Attribute Write -Description 'Specifies the IPv6 subnet routes that are added to a site-to-site interface after the connection is established. The values specified are not used to initiate the site-to-site VPN connection.'
    $Resource.Param += New-xDscResourceProperty -Name PromoteAlternate -Type Boolean -Attribute Write -Description 'Specifies an IP address that if successfully connected becomes the primary IP address, and the current primary IP address is moved to the alternate list.'
    $Resource.Param += New-xDscResourceProperty -Name Protocol -Type String -Attribute Write -Description 'Specifies the underlying protocol used for tunneling.'
    $Resource.Param += New-xDscResourceProperty -Name RadiusAttributeClass -Type String -Attribute Write -Description 'Specifies a RADIUS attribute.'
    $Resource.Param += New-xDscResourceProperty -Name ResponderAuthenticationMethod -Type String -Attribute Write -Description 'Specifies the authentication method to be used by the S2S initiator to validate the S2S responder.'
    $Resource.Param += New-xDscResourceProperty -Name RetryIntervalSeconds -Type UInt32 -Attribute Write -Description 'Specifies the time interval, in seconds, to wait between retries.'
    $Resource.Param += New-xDscResourceProperty -Name RoutingDomain -Type String -Attribute Write -Description 'Specifies an ID, as a string, for a routing domain. The ID of a routing domain is a user-defined alphanumeric string.'
    $Resource.Param += New-xDscResourceProperty -Name RxBandwidthKbps -Type UInt64 -Attribute Write -Description 'Specifies the receive bandwidth limit, in kilobits per second (Kbps).'
    $Resource.Param += New-xDscResourceProperty -Name SADataSizeForRenegotiationKilobytes -Type UInt32 -Attribute Write -Description 'Specifies the amount of data, in kilobytes (KB), that can be transferred using a security association (SA). When the limit is reached, the SA must be renegotiated.'
    $Resource.Param += New-xDscResourceProperty -Name SALifeTimeSeconds -Type UInt32 -Attribute Write -Description 'Specifies the lifetime, in seconds, of a security association (SA). The SA is no longer valid after this time interval.'
    $Resource.Param += New-xDscResourceProperty -Name SharedSecret -Type String -Attribute Write -Description 'Specifies the text of the shared secret to be used in the connection. This parameter is only applicable only if the AuthenticationMethod parameter is set to PSK or the ResponderAuthenticationMethod parameter is set to PSK.'
    $Resource.Param += New-xDscResourceProperty -Name SourceIpAddress -Type String -Attribute Write -Description 'Specifies the source IPv4 or IPv6 addresses to use when dialing the connection.'
    $Resource.Param += New-xDscResourceProperty -Name ThrottleLimit -Type UInt32 -Attribute Write -Description 'Specifies the maximum number of concurrent operations that can be established to run the cmdlet. If this parameter is omitted or a value of 0 is entered, then Windows PowerShell® calculates an optimum throttle limit for the cmdlet based on the number of CIM cmdlets that are running on the computer. The throttle limit applies only to the current cmdlet, not to the session or to the computer.'
    $Resource.Param += New-xDscResourceProperty -Name TxBandwidthKbps -Type UInt64 -Attribute Write -Description 'Specifies a transmit bandwidth limit, in Kbps, for the interface.'
    $Resource.Param += New-xDscResourceProperty -Name User -Type PSCredential -Attribute Write -Description 'Specifies the user name to be used for the connection. Applicable only if AuthenticationMethod parameter is set to EAP.'
    New-xDscResource -Name MSFT_$($Resource.Name) -Property $Resource.Param -FriendlyName $Resource.Name @standard
    $Resources += $Resource

    $Resource = @{Name = 'VpnServerIPsecConfiguration'; Param = @()}
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name AuthenticationTransformConstants -Type String -Attribute Write -Description 'Specifies the authentication transform in the IPsec policy.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name CipherTransformConstants -Type String -Attribute Write -Description 'Specifies the cipher in the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name CustomPolicy -Type String -Attribute Write -Description 'Specifies the custom IKE IPsec policies.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name DHGroup -Type String -Attribute Write -Description 'Specifies the Diffie-Hellman (DH) group in the IPsec policy.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name EncryptionMethod -Type String -Attribute Write -Description 'Specifies the encryption method in the IKE policy.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name EncryptionType -Type String -Attribute Key -Description 'Specifies the type of encryption.'
    $Resource.Param += New-xDscResourceProperty -Name IdleDisconnectSeconds -Type UInt32 -Attribute Write -Description 'Specifies the time, in seconds, after which an idle connection is disconnected. Unless the idle time-out is Disabled, the entire connection is disconnected if the connection is idle for the specified interval.'
    $Resource.Param += New-xDscResourceProperty -Name Ikev2Ports -Type UInt32 -Attribute Write -Description 'Specifies the number of IKEv2 ports to create.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name IntegrityCheckMethod -Type String -Attribute Write -Description 'Specifies the integrity method in the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name L2tpPorts -Type UInt32 -Attribute Write -Description 'Specifies the number of L2TP ports to create.'
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name PfsGroup -Type String -Attribute Write -Description 'Specifies the perfect forward secrecy (PFS) group in the IPsec policy.'
    $Resource.Param += New-xDscResourceProperty -Name SADataSizeForRenegotiationKilobytes -Type UInt32 -Attribute Write -Description 'Specifies the number of kilobytes that are allowed to transfer using a security association (SA). After that the SA will be renegotiated.'
    $Resource.Param += New-xDscResourceProperty -Name SALifeTimeSeconds -Type UInt32 -Attribute Write -Description 'Specifies the lifetime of a SA in seconds, after which the SA is no longer valid.'
    New-xDscResource -Name MSFT_$($Resource.Name) -Property $Resource.Param -FriendlyName $Resource.Name @standard
    $Resources += $Resource

    $Resource = @{Name = 'VpnS2SInterfaceConnection'; Param = @()}
    #ValidateSet
    $Resource.Param += New-xDscResourceProperty -Name Name -Type String -Attribute Key -Description 'Specifies the name of the connection.'
    $Resource.Param += New-xDscResourceProperty -Name Ensure -Type String -Attribute Write -ValidateSet 'Present','Absent' -Description 'Governs whether DSC should verify the site to site connection is in a connected or disconnected state.'
    New-xDscResource -Name MSFT_$($Resource.Name) -Property $Resource.Param -FriendlyName $Resource.Name @standard
    $Resources += $Resource
}


# Markdown Generator
# This is experimental.  Expected to become 100% efficient in future version.  Import example from script, etc.

$MD = @"
<--AppVeyorBadge-->

The **$ModuleName** module is a part of the Windows PowerShell Desired State Configuration (DSC) Resource Kit, which is a collection of DSC Resources. $Description, with simple declarative language.

## Installation

To install **$ModuleName** module

-   If you are using WMF4 / PowerShell Version 4: Unzip the content under the $env:ProgramFiles\WindowsPowerShell\Modules folder

-   If you are using WMF5 Preview: From an elevated PowerShell session run "Install-Module $ModuleName"

To confirm installation

-   Run Get-DSCResource to see that the resources listed above are among the DSC Resources displayed

## Contributing
Please check out common DSC Resources [contributing guidelines](https://github.com/PowerShell/DscResource.Kit/blob/master/CONTRIBUTING.md).

## Resources
"@
foreach ($r in $Resources) {
$MD += @"

**$($r.Name)** resource has following properties

"@
foreach ($p in $r.Param) {
$MD += @"
- **$($p.Name)**: $($p.Description)

"@
}
$MD += @'


'@
}

$MD += @'

Versions
--------

**0.1.0.0**

Initial release with the following resources:
'@

foreach ($r in $Resources) {
$MD += @"
 - $($r.Name)

"@
}

$MD += @'

Examples
--------

```powershell
# placeholder
```
'@
$MD | Out-File "$moduleFolder\ReadMe.md"

# Generate License File
if (-not (Test-Path "$moduleFolder\License.txt")) {
@'
The MIT License (MIT)

Copyright (c) 2015 Michael Greene

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

'@ | out-file -FilePath "$moduleFolder\LICENSE"
}

# Generate AppVeyor file
if (-not (Test-Path "$moduleFolder\appveyor.yml")) {
@'
install: 
    - cinst -y pester
    - git clone https://github.com/PowerShell/DscResource.Tests

build: false

test_script:
    - ps: |
        $testResultsFile = ".\TestsResults.xml"
        $res = Invoke-Pester -OutputFormat NUnitXml -OutputFile $testResultsFile -PassThru
        (New-Object 'System.Net.WebClient').UploadFile("https://ci.appveyor.com/api/testresults/nunit/$($env:APPVEYOR_JOB_ID)", (Resolve-Path $testResultsFile))
        if ($res.FailedCount -gt 0) { 
            throw "$($res.FailedCount) tests failed."
        }
on_finish:
    - ps: |
        $stagingDirectory = (Resolve-Path ..).Path
        $zipFile = Join-Path $stagingDirectory "$(Split-Path $pwd -Leaf).zip"
        Add-Type -assemblyname System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($pwd, $zipFile)
        @(
            # You can add other artifacts here
            (ls $zipFile)
        ) | % { Push-AppveyorArtifact $_.FullName }

'@ | out-file -FilePath "$moduleFolder\appveyor.yml"
}