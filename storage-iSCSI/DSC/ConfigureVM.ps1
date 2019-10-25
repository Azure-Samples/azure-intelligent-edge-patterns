configuration ConfigureVM
{
   param
    (

    )

    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -Module ComputerManagementDsc
    Node localhost
    {
        PendingReboot CheckforReboot
        {
            Name       = 'CheckforReboot'
        }
      
    }
}