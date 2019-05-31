Function Connect-AzureAccount {
    <#
    .DESCRIPTION
    Log into Azure public or an AzureStack instance.
    .EXAMPLE
    Connect-AzureAccount -Azure -Credential $cred
    Connects to the Azure public cloud using credentials stored in $cred.
    .EXAMPLE
    Connect-AzureAccount -Endpoint https://management.westus.stackpoc.com -Tenant mashybridpartner.onmicrosoft.com
    Connects to an AzureStack environment.
    .NOTES
    The cached context contains the user's authentication token.
    .PARAMETER Azure
    Authenticate with Azure public.
    .PARAMETER Credential
    AzureAD credentials.
    .PARAMETER Endpoint
    The ARM endpoint for an AzureStack instance.
    .PARAMETER Path
    Path at which to store the cached AzureRM context as a JSON file. Context is not cached if no path is provided.
    .PARAMETER Subscription
    Name or id of the subscription to which to connect.
    .PARAMETER Tenant
    Azure AD tenant associated with an AzureStack instance.
    .SYNOPSIS
    Log into Azure(Stack).
    #>
    [CmdletBinding()]
    Param([Parameter(ParameterSetName='Azure')][Switch]$Azure,
          [Parameter(Mandatory=$false)][System.Management.Automation.PSCredential]$Credential,
          [Parameter(Mandatory=$true,ParameterSetName='Stack')][System.URI]$Endpoint,
          [Parameter(Mandatory=$false)][System.String]$Path,
          [Parameter(Mandatory=$false)][System.String]$Subscription,
          [Parameter(Mandatory=$true,ParameterSetName='Stack')][System.String]$Tenant)
    $a = @{}
    if ($PSCmdlet.ParameterSetName -eq 'Stack') {
        $env = Get-AzureRmEnvironment | Where-Object Name -EQ $Endpoint.Host
        if (-not $env) {
            Add-AzureRMEnvironment -Name $Endpoint.Host -ArmEndpoint $Endpoint.AbsoluteUri | Out-String | Write-Verbose
            $env = Get-AzureRmEnvironment | Where-Object Name -EQ $Endpoint.Host
        }
        $ep = '{0}{1}/.well-known/openid-configuration' -f $env.ActiveDirectoryAuthority,$Tenant
        $oauth = (Invoke-WebRequest -UseBasicParsing $ep).Content | ConvertFrom-Json
        $a['EnvironmentName'] = $env.Name
        $a['TenantId'] = $oauth.Issuer.Split('/')[3]
    }
    if ($Credential) {
        $a['Credential'] = $Credential
    }
    Login-AzureRmAccount @a | Out-String | Write-Verbose
    [System.Guid]$sub = New-Object -TypeName System.Guid
    if ([System.String]::IsNullOrEmpty($Subscription)) {
        $sublist = Get-AzureRmSubscription
    }
    elseif ([System.Guid]::TryParse($Subscription,[ref]$sub)) {
        $sublist = Get-AzureRmSubscription -SubscriptionId $Subscription
    }
    else {
        $sublist = Get-AzureRmSubscription -SubscriptionName $Subscription
    }
    Select-Item -Choices $sublist -Description Subscription -Display Name | Select-AzureRmSubscription | Out-String | Write-Verbose
    if ([System.String]::IsNullOrEmpty($Path)) {
        return
    }
    Save-AzureRmContext -Force -Path $Path -WarningAction SilentlyContinue
}
Function Connect-VPNConnection {
    <#
    .DESCRIPTION
    Establishes VPN connectivity between Azure(Stack) virtual network gateways.
    .PARAMETER AContext
    Path to the cached AzureRM context for Side A.
    .PARAMETER AName
    Name for Side A.
    .PARAMETER AResourceGroup
    Name of the resource group containing the Side A Virtual network gateway.
    .PARAMETER ASubnet
    Address space(s) of the Side A virtual network.
    .PARAMETER AVirtualGateway
    Name of the Side A virtual network gateway.
    .PARAMETER BContext
    Path to the cached AzureRM context for Side B.
    .PARAMETER BName
    Name for Side B.
    .PARAMETER BResourceGroup
    Name of the resource group containing the Side B Virtual network gateway.
    .PARAMETER BSubnet
    Address space(s) of the Side B virtual network subnet.
    .PARAMETER BVirtualGateway
    Name of the Side B virtual network gateway.
    .PARAMETER Key
    VPN connection key.
    .PARAMETER RoutingWeight
    Routing weight for the new VPN connection.
    .SYNOPSIS
    Establishes VPN connectivity.
    #>
    [Cmdletbinding()]
    Param([Parameter(Mandatory=$true)][System.String]$AContext,
          [Parameter(Mandatory=$true)][System.String]$AName,
          [Parameter(Mandatory=$true)][System.String]$AResourceGroup,
          [Parameter(Mandatory=$true)][System.String[]]$ASubnet,
          [Parameter(Mandatory=$true)][System.String]$AVirtualGateway,
          [Parameter(Mandatory=$true)][System.String]$BContext,
          [Parameter(Mandatory=$true)][System.String]$BName,
          [Parameter(Mandatory=$true)][System.String]$BResourceGroup,
          [Parameter(Mandatory=$true)][System.String[]]$BSubnet,
          [Parameter(Mandatory=$true)][System.String]$BVirtualGateway,
          [Parameter(Mandatory=$true)][System.String]$Key,
          [Parameter(Mandatory=$false)][System.Int32]$RoutingWeight = 10)
    Import-AzureRmContext -Path $AContext | Out-String | Write-Verbose
    $a = @{Key            = $Key
           Name           = $BName
           RemoteSubnet   = $BSubnet
           RemoteVpnIp    = '0.0.0.0'
           ResourceGroup  = $AResourceGroup
           RoutingWeight  = $RoutingWeight
           VirtualGateway = $AVirtualGateway
           WhatIf         = $true}
    $ip = New-VPNConnection @a
    Import-AzureRmContext -Path $BContext | Out-String | Write-Verbose
    $a = @{Key            = $Key
           Name           = $AName
           RemoteSubnet   = $ASubnet
           RemoteVpnIp    = $ip
           ResourceGroup  = $BResourceGroup
           RoutingWeight  = $RoutingWeight
           VirtualGateway = $BVirtualGateway}
    $ip = New-VPNConnection @a
    Import-AzureRmContext -Path $AContext | Out-String | Write-Verbose
    $a = @{Key            = $Key
           Name           = $BName
           RemoteSubnet   = $BSubnet
           RemoteVpnIp    = $ip
           ResourceGroup  = $AResourceGroup
           RoutingWeight  = $RoutingWeight
           VirtualGateway = $AVirtualGateway}
    New-VPNConnection @a | Out-Null
}
Function Get-Resource {
    <#
    .DESCRIPTION
    Get an Azure(Stack) resource creating the resource if not present.
    .EXAMPLE
    Get-Resource -Create {New-AzureRmResourceGroup -Location WestUs -Name testrg} -Get {Get-AzureRmResourceGroup -ResourceGroupName testrg} -Type 'Resource Group'
    Gets a resource group.
    .EXAMPLE
    $Script:bn = $Script:n = 'michaeltwsfc';Get-Resource -Create {New-AzureRmStorageAccount -Location WestUs -Name $Script:n -ResourceGroupName testrg -Type Standard_LRS} -Get {Get-AzureRmStorageAccount -Name $Script:n -ResourceGroupName testrg} -Type 'Storage Account' -ValidateName {$avail = Get-AzureRmStorageAccountNameAvailability -Name $Script:n;while (-not $avail.NameAvailable) {$Script:n = '{0}{1}' -f $Script:bn,[System.Guid]::NewGuid().Guid.SubString(24);$avail = Get-AzureRmStorageAccountNameAvailability -Name $Script:n}}
    Gets a storage account. See notes for commented version.
    .NOTES
    #Here we set the base name and the chosen name in the script scope
    $Script:bn = $Script:n = 'michaeltwsfc'
    Get-Resource -Create {
        #This only is run if the resource is not found
        New-AzureRmStorageAccount -Location WestUs -Name $Script:n -ResourceGroupName testrg -Type Standard_LRS
    } -Get {
        #Attempt to get the resource
        Get-AzureRmStorageAccount -Name $Script:n -ResourceGroupName testrg
    } -Type 'Storage Account' -ValidateName {
        #Check the availability and validity of the chosen name
        $avail = Get-AzureRmStorageAccountNameAvailability -Name $Script:n
        while (-not $avail.NameAvailable) {
            #Choose a new name (base name + psudo ramdom string)
            $Script:n = '{0}{1}' -f $Script:bn,[System.Guid]::NewGuid().Guid.SubString(24)
            #Must use script scope or the new name will be lost (go out of scope)
            #Check availability of new name
            $avail = Get-AzureRmStorageAccountNameAvailability -Name $Script:n
        }
    }
    .PARAMETER Create
    Command to run to create the resource.
    .PARAMETER Get
    Command to run to get the resource.
    .PARAMETER Type
    Type of resource.
    .PARAMETER ValidateName
    Command to run to validate the name is valid.
    .SYNOPSIS
    Get a resource.
    #>
    [CmdletBinding()]
    Param([Parameter(Mandatory=$true)][ScriptBlock]$Create,
          [Parameter(Mandatory=$true)][ScriptBlock]$Get,
          [Parameter(Mandatory=$false)][System.String]$Type = 'Resource',
          [Parameter(Mandatory=$false)][ScriptBlock]$ValidateName = $null)
    $ErrorActionPreference = 'Stop'
    try {
        $rec = $Get.Invoke()    
    }
    catch {}
    if ($rec) {
        Write-Verbose -Message "${Type} already exists"
        $rec[0] | Out-String | Write-Verbose
        return $rec[0]
    }
    if ($ValidateName) {
        $ValidateName.Invoke() | Out-String | Write-Verbose
    }
    $Create.Invoke() | Out-String | Write-Verbose
    while (-not $rec) {
        Start-Sleep -Seconds 1 | Out-Null
        try {
            $rec = $Get.Invoke()    
        }
        catch {}
    }
    Write-Verbose -Message "Created ${Type}"
    return $rec[0]
}
Function New-VPNConnection {
    <#
    .DESCRIPTION
    Establish a site to site VPN connection in Azure(Stack).
    .NOTES
    Azure(Stack) does not always assign a public IP address to a virtual network gateway that doesn't have any connections.
    As a workaround a temporary local network gateway (TempGateway) and connection (TempConnection) can be included in the ARM template.
    When this function runs, it will create a new local network gateway and connection.
    The TempConnection and the TempGateway will then be removed if present.
    Using this method we can set up multiple VPN connections to a virtual network gateway.
    .PARAMETER Key
    VPN connection key.
    .PARAMETER Name
    Name for the remote site.
    .PARAMETER RemoteSubnet
    Address space(s) of the partner virtual network subnet.
    .PARAMETER RemoteVpnIp
    Public IP address of the remote virtual network gateway.
    .PARAMETER ResourceGroup
    Name of the resource group containing the Virtual network gateway.
    .PARAMETER RoutingWeight
    Routing weight for the new VPN connection.
    .PARAMETER VirtualGateway
    Name of the virtual network gateway.
    .PARAMETER WhatIf
    Describe the changes to be made without making them.
    .SYNOPSIS
    Establish a site to site VPN connection.
    #>
    [Cmdletbinding()]
    Param([Parameter(Mandatory=$true)][System.String]$Key,
          [Parameter(Mandatory=$true)][System.String]$Name,
          [Parameter(Mandatory=$true)][System.String[]]$RemoteSubnet,
          [Parameter(Mandatory=$true)][System.String]$RemoteVpnIp,
          [Parameter(Mandatory=$true)][System.String]$ResourceGroup,
          [Parameter(Mandatory=$false)][System.Int32]$RoutingWeight = 10,
          [Parameter(Mandatory=$true)][System.String]$VirtualGateway,
          [Parameter(Mandatory=$false)][Switch]$WhatIf)
    $a = @{Name              = $VirtualGateway
           ResourceGroupName = $ResourceGroup}
    $vg = Get-AzureRmVirtualNetworkGateway @a
    if ($WhatIf) {
        Write-Verbose -Message "What if: Performing the operation New-AzureRmLocalNetworkGateway on ${Name}"
        Write-Verbose -Message "What if: Performing the operation New-AzureRMVirtualNetworkGatewayConnection on ${Name}"
    }
    else {
        $a = @{AddressPrefix     = $RemoteSubnet
               Force             = $true
               GatewayIpAddress  = $RemoteVpnIp
               Location          = $vg.Location
               Name              = $Name
               ResourceGroupName = $vg.ResourceGroupName}
        $lg = New-AzureRmLocalNetworkGateway @a
        $a = @{ConnectionType         = 'IPsec'
               LocalNetworkGateway2   = $lg
               Location               = $vg.Location
               Name                   = $Name
               ResourceGroupName      = $vg.ResourceGroupName
               RoutingWeight          = $RoutingWeight
               SharedKey              = $Key
               VirtualNetworkGateway1 = $vg}
        New-AzureRMVirtualNetworkGatewayConnection @a
    }
    $a = @{Name              = 'TempConnection'
           ResourceGroupName = $vg.ResourceGroupName}
    try {
        $temp = Get-AzureRmVirtualNetworkGatewayConnection @a
    }
    catch {
        $temp = $null
    }
    if ($temp) {
        if ($WhatIf) {
            Write-Verbose -Message "What if: Performing the operation Remove-AzureRmVirtualNetworkGatewayConnection on TempConnection"
        }
        else {
            $a['Force'] = $true
            Remove-AzureRmVirtualNetworkGatewayConnection @a
        }
    }
    $a = @{Name              = 'TempGateway'
           ResourceGroupName = $vg.ResourceGroupName}
    try {
        $temp = Get-AzureRmLocalNetworkGateway @a
    }
    catch {
        $temp = $null
    }
    if ($temp) {
        if ($WhatIf) {
            Write-Verbose -Message "What if: Performing the operation Remove-AzureRmLocalNetworkGateway on TempGateway"
        }
        else {
            $a['Force'] = $true
            Remove-AzureRmLocalNetworkGateway @a
        }
    }
    $rec = Get-AzureRmResource -ResourceId $vg.IpConfigurations.PublicIpAddress.Id
    return $rec.Properties.ipAddress
}
Function Select-Item {
    <#
    .DESCRIPTION
    Select an item in a set prompting the user if there is more than one choice.
    .EXAMPLE
    Select-Item -Choices (Get-AzureRmEnvironment) -Description Environment -Display Name
    Allows the user to choose an environment by Name.
    .PARAMETER Choices
    Available choices.
    .PARAMETER Description
    What is the user choosing?
    .PARAMETER Display
    What property of the itemss should be displayed to the user?
    .SYNOPSIS
    Select an item.
    #>
    [CmdletBinding()]
    Param([Parameter(Mandatory=$true)][System.Object[]]$Choices,
          [Parameter(Mandatory=$true)][System.String]$Description,
          [Parameter(Mandatory=$true)][System.String]$Display)
    if ($Choices.Count -eq 0) {
        Write-Warning -Message "No ${Description}s are available"
        return $null
    }
    if ($Choices.Count -eq 1) {
        Write-Verbose -Message "Only one ${Description} is available"
        return $Choices[0]
    }
    [System.Object]$itemSet = $Choices | Sort-Object -Property $Display
    Write-Host "Please choose a ${Description}"
    for ($i = 0;$i -lt $itemSet.Count;++$i) {
        $num = $i + 1
        $text = Invoke-Expression -Command "`$itemSet[${i}].${Display}"
        Write-Host ('{0,2}) {1}' -f $num,$text)
    }
    [System.UInt16]$num = 0
    while ($num -eq 0) {
        $choice = Read-Host "Please choose (1 - $($itemSet.Count))"
        if (-not [System.UInt16]::TryParse($choice, [ref]$num) -or $num -eq 0 -or $num -gt $itemSet.Count) {
            $num = 0
            Write-Warning -Message "Invalid choice"
        }
    }
    --$num
    return $itemSet[$num]
}