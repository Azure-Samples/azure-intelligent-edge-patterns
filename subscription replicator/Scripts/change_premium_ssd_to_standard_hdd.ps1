#

param(
    [Parameter(Mandatory=$true)]
    [String]$vmName,

    [Parameter(Mandatory=$true)]
    [String]$rgName
)

# Choose between Standard_LRS and Premium_LRS based on your scenario
$storageType = 'Standard_LRS'


# Stop and deallocate the VM before changing the size
Stop-AzureRmVM -ResourceGroupName $rgName -Name $vmName -Force

$vm = Get-AzureRmVM -Name $vmName -resourceGroupName $rgName

# Get all disks in the resource group of the VM
$vmDisks = Get-AzureRmDisk -ResourceGroupName $rgName 

# For disks that belong to the selected VM, convert to Premium storage
foreach ($disk in $vmDisks)
{
	if ($disk.ManagedBy -eq $vm.Id)
	{
		$diskUpdateConfig = New-AzureRmDiskUpdateConfig –AccountType $storageType
		Update-AzureRmDisk -DiskUpdate $diskUpdateConfig -ResourceGroupName $rgName `
		-DiskName $disk.Name
	}
}

Start-AzureRmVM -ResourceGroupName $rgName -Name $vmName