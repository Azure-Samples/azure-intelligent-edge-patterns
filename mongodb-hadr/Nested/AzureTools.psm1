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