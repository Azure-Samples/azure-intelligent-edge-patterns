$j = 0
Get-Date -DisplayHint Time
while($j -lt 100)
{
        Write-Output $j
        python.exe .\runtest_infer2.py
        $j++
}
Get-Date -DisplayHint Time