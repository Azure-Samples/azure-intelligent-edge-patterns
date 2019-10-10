# You can use xRemoteAccess for greater configuration control
# https://github.com/mgreenegit/xRemoteAccess/

configuration InstallRRAS
{
   param
    (

    )

    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -Module ComputerManagementDsc
    Node localhost
    {
        PendingReboot BeforeRoutingInstall
        {
            Name       = 'BeforeRoutingInstall'
        }
        WindowsFeature Routing
        {
            Ensure = 'Present'
            Name = 'Routing'
            DependsOn  = '[PendingReboot]BeforeRoutingInstall'

        }
        PendingReboot AfterRoutingInstall
        {
            Name       = 'RoutingInstall'
            DependsOn  = '[WindowsFeature]Routing'
        }
        WindowsFeature RemoteAccessPowerShell
        {
            Ensure = 'Present'
            Name = 'RSAT-RemoteAccess-PowerShell'
            DependsOn = '[WindowsFeature]Routing'
        }
        PendingReboot AfterRemoteAccessInstall
        {
            Name       = 'RoutingInstall'
            DependsOn  = '[WindowsFeature]RemoteAccessPowerShell'
        }
        Service RemoteAccess
        {
            Name        = "RemoteAccess"
            StartupType = "Automatic"
            State       = "Running"
            DependsOn = '[WindowsFeature]Routing'
        }
        

    }
}