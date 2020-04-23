az login
$resourceGroupName= Read-Host -Prompt 'Input Resource Group name'
$uniqueID = Read-Host -Prompt 'Input unique ID'
$envfile = "./.env"
$cosmosaccountName = 'facedbedb-' + $uniqueID
$strgaccountname = $uniqueID + 'storage'
$month = Get-Date -format '%M'
$month = $month -as [int]
$month = $month + 6
$expire = Get-Date -format '%yy-%M-%dT%H:%m%Z' -Month $month

$contregname = "ignitecr"+$uniqueID
Set-Content $envfile ("CONTAINER_REGISTRY_USERNAME=" + $contregname)

$creds = Get-AzureRmContainerRegistryCredential -ResourceGroupName $resourceGroupName -Name $contregname
Add-Content $envfile ("CONTAINER_REGISTRY_PASSWORD=" + $creds.Password)

$contregserver = $contregname+".azurecr.io"
Add-Content $envfile ("CONTAINER_REGISTRY_LOGIN_SERVER=" + $contregserver)

$countingimage = $contregserver+"/intelligentretail/counting"
Add-Content $envfile ("COUNTING_IMAGE=" + $countingimage)

$sasstr = az storage account generate-sas --permissions cdlruwap --account-name $strgaccountname --services bfqt --expiry $expire --resource-types sco
$strgsasulr = '"BlobEndpoint=https://'+$strgaccountname+".blob.core.windows.net/;QueueEndpoint=https://"+$strgaccountname+".queue.core.windows.net/;FileEndpoint=https://.file.core.windows.net/;TableEndpoint=https://"+$strgconnstr+".table.core.windows.net/;SharedAccessSignature="+$sasstr.TrimStart('"')
Add-Content $envfile ("BLOB_STORAGE_SAS_URL=" + $strgsasulr)

Add-Content $envfile 'CAMERA_ID_FIXED_IMAGE="fixed_image"'
Add-Content $envfile 'CAMERA_ID_CYCLE_IMAGES="cycle_images"'

$strgconnstr = az storage account show-connection-string -n $strgaccountname -g $resourceGroupName
$parsedstrgconnstr = $strgconnstr[1].Substring($strgconnstr[1].IndexOf('DefaultEnd')-1)
Add-Content $envfile ("STORAGE_FACE=" + $parsedstrgconnstr)

$connstrs = az cosmosdb keys list -n $cosmosaccountName -g $resourceGroupName --type connection-strings
$parsedconnstr = $connstrs[3].Substring($connstrs[3].IndexOf("mongodb")-1).TrimEnd(",")
Add-Content $envfile ("COSMOSDB_FACE=" + $parsedconnstr)

$keys = Get-AzureRmCognitiveServicesAccountKey -ResourceGroupName $resourceGroupName -Name ignitedemo-cognitiveservices
Add-Content $envfile ("API_KEY="+$keys.Key1)