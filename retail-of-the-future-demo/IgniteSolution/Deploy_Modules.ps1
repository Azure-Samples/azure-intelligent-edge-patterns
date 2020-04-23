az login

echo "Selecting Subscription..."
$subscriptionName = Read-Host -Prompt 'Input Subscription Name'
az account set --subscription $subscriptionName

$resourceGroupName= Read-Host -Prompt 'Input Resource Group name'
$uniqueID = Read-Host -Prompt 'Input unique ID'

$contregname = "ignitecr"+$uniqueID

$creds = Get-AzureRmContainerRegistryCredential -ResourceGroupName $resourceGroupName -Name $contregname

$contregserver = $contregname+".azurecr.io"

az acr login --username $contregname --password $creds.Password --name $contregname
docker build -t intelligentretail/base -f .\base.dockerfile .
docker build -t intelligentretail/counting -f .\modules\Counting\people-count.dockerfile .\modules\Counting\
docker build -t intelligentretail/camerastream -f .\modules\CameraStream\camera-stream.dockerfile .\modules\CameraStream\
docker tag intelligentretail/counting ($contregserver+"/intelligentretail/counting")
docker tag intelligentretail/camerastream ($contregserver+"/intelligentretail/camerastream")
docker push ($contregserver+"/intelligentretail/counting")
docker push ($contregserver+"/intelligentretail/camerastream")