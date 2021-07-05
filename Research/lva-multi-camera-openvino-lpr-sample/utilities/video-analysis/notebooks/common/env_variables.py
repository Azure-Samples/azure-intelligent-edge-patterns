# Sets static global variables for Jupyter notebooks

import warnings
import logging
logging.disable(logging.WARNING)

try:
    from dotenv import set_key, get_key, find_dotenv
    envPath = find_dotenv(raise_error_if_not_found=True)
except IOError:
    import os
    from pathlib import Path

    try:
        project_folder = Path(__file__).parent.absolute()
        envPath = find_dotenv(os.path.join(project_folder, '.env'))
    except Exception:
        print(".env not found")

azureSubscriptionId = get_key(envPath, "SUBSCRIPTION_ID")
resourceLocation = get_key(envPath, "RESOURCE_LOCATION")
resourceGroupName = get_key(envPath, "RESOURCE_GROUP")
acrServiceName = get_key(envPath, "ACR_SERVICE_NAME")
acrServiceFullName = get_key(envPath, "ACR_SERVICE_FULL_NAME")
iotHubServiceName = get_key(envPath, "IOT_HUB_SERVICE_NAME")
iotDeviceId = get_key(envPath, "IOT_DEVICE_ID")
mediaServiceName = get_key(envPath, "AMS_ACCOUNT")
storageServiceName = get_key(envPath, "STORAGE_SERVICE_NAME")
acrUserName = get_key(envPath, "CONTAINER_REGISTRY_USERNAME_myacr")
acrPassword = get_key(envPath, "CONTAINER_REGISTRY_PASSWORD_myacr")
containerImageName = get_key(envPath, "CONTAINER_IMAGE_NAME")
aadTenantId = get_key(envPath, "AAD_TENANT_ID")
aadServicePrincipalId = get_key(envPath, "AAD_SERVICE_PRINCIPAL_ID")
aadServicePrincipalSecret = get_key(envPath, "AAD_SERVICE_PRINCIPAL_SECRET")
iotHubConnString = get_key(envPath, "IOT_HUB_CONN_STRING")
iotEdgeDeviceConnString = get_key(envPath, "IOT_EDGE_DEVICE_CONN_STRING")
sshstring = get_key(envPath, "SSH_STRING")
isSolutionPath = get_key(envPath, "IS_SOLUTION_PATH")
