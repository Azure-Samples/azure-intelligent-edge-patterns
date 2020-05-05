#az login

echo "Selecting Subscription..."
$subscriptionName = Read-Host -Prompt 'Input Subscription Name'
az account set --subscription $subscriptionName

$resourceGroupName = Read-Host -Prompt 'Input Resource Group name'
$uniqueID = Read-Host -Prompt 'Input unique ID'
$envfile = "./.env"


Set-Content $envfile 'CAMERA_ID_FIXED_IMAGE="fixed_image"'
Add-Content $envfile 'CAMERA_ID_CYCLE_IMAGES="cycle_images"'


$contregname = "ignitecr"+$uniqueID
Add-Content $envfile ("CONTAINER_REGISTRY_USERNAME=" + $contregname)

$creds = Get-AzureRmContainerRegistryCredential -ResourceGroupName $resourceGroupName -Name $contregname
Add-Content $envfile ("CONTAINER_REGISTRY_PASSWORD=" + $creds.Password)

$contregserver = $contregname+".azurecr.io"
Add-Content $envfile ("CONTAINER_REGISTRY_LOGIN_SERVER=" + $contregserver)


# Retrieve connection string for image storage
$strgaccountname = $uniqueID + 'storage'
$strgconnstr = az storage account show-connection-string `
    -n $strgaccountname `
    -g $resourceGroupName | 
    ConvertFrom-Json | 
    Select-Object -ExpandProperty connectionString

Add-Content $envfile ("BLOB_STORAGE_SAS_URL=" + $strgconnstr)


# Connection information for Face Storage
$facedbstorage= "storagedbeface" + $uniqueID
$facesstrgconnstr = az storage account show-connection-string `
    -n $facedbstorage `
    -g $resourceGroupName |
    ConvertFrom-Json | 
    Select-Object -ExpandProperty connectionString
    
Add-Content $envfile ("STORAGE_FACE=" + $facesstrgconnstr)


# Retrieve Cosmos DB connection string
$cosmosaccountName = 'facedbedb-' + $uniqueID
$connstrs = az cosmosdb keys list -n $cosmosaccountName -g $resourceGroupName --type connection-strings
$parsedconnstr = $connstrs[3].Substring($connstrs[3].IndexOf("mongodb")-1).TrimEnd(",")
Add-Content $envfile ("COSMOSDB_FACE=" + $parsedconnstr)


# Add variables for General Cognitive Services
$csLocation = Get-AzureRmCognitiveServicesAccount -ResourceGroupName $resourceGroupName -Name ignitedemo-cognitiveservices | Select-Object -ExpandProperty Location
$csKeys = Get-AzureRmCognitiveServicesAccountKey -ResourceGroupName $resourceGroupName -Name ignitedemo-cognitiveservices
Add-Content $envfile ("COGNITIVE_SERVICES_LOCATION="+$csLocation)
Add-Content $envfile ("API_KEY="+$csKeys.Key1)


# Add variables for LUIS authoring
$luisName = "ignitedemo-luis-Authoring-"+$uniqueID
$luisLocation = Get-AzureRmCognitiveServicesAccount -ResourceGroupName $resourceGroupName -Name $luisName | Select-Object -ExpandProperty Location
$luisKeys = Get-AzureRmCognitiveServicesAccountKey -ResourceGroupName $resourceGroupName -Name $luisName
Add-Content $envfile ("LUIS_LOCATION="+$luisLocation)
Add-Content $envfile ("LUIS_KEY="+$luisKeys.Key1)

iotedgedev genconfig -f deployment.remote.template.json
$iotName = Read-Host -Prompt 'Input your IoT Hub name'
$aseName = Read-Host -Prompt 'Input name of your Azure Stack Edge device in IoT Hub'
az iot edge deployment create --deployment-id retail_suite --hub-name $iotName --content .\config\deployment.remote.amd64.json  --target-condition "deviceId = '$aseName'"