@{
    AllNodes = @(
        @{
        NodeName = 'localhost'
        Role = 'LocalNetworkS2SGateway'
        AzureNetworkIP = 'vnet.public.ip.address'
        AzureIPv4Subnet = '10.0.0.0/24:100'
        AzureNetworkSharedSecret = 'SECRET'
        };
    )
}