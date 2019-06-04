# Deploy a Staged Data Analytics Solution
## About this sample
### Overview
This sample will show you how to deploy a solution for collecting data
that requires analysis at the point of collection so that quick
decisions can be made. Often this data collection occurs with no
Internet access. When connectivity is established, you may need to do a
resource-intensive analysis of the data to gain additional insight.

In this tutorial, you’ll create a sample environment to:
  - Create the raw data storage blob.
  - Create a New Azure Stack Function to move clean data from Azure
    Stack to Azure.
  - Create a Blob storage triggered function.
  - Create an Azure Stack storage account containing a blob and a queue.
  - Create a queue triggered function.
  - Test the queue triggered function.

### Architecture

![](.\\stageddata-media\\/media/image1.png)

## How to run this sample
### Prerequisites

  - An installed and functioning Azure Stack Integrated System (Azure
    Stack) or Azure Stack Development Kit (ASDK), running Azure App
    Service.
  - An Azure subscription.
  - An Azure Active Directory (AAD) service principal that has
    permissions to the tenant subscription on Azure and Azure Stack. You
    may need to create two service principals if the Azure Stack is
    using a different AAD tenant than your Azure subscription. To learn
    how to create a service principal for Azure Stack, go
    [here](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-create-service-principals).    
      - **Make a note of each service principal’s application ID, client
        secret, Azure AD Tenant ID, and tenant name
        (xxxxx.onmicrosoft.com).**
  - You will need to provide a collection of data for data analysis.
    Sample data is provided.
  - [Docker for Windows](https://docs.docker.com/docker-for-windows/)
    installed on your local machine.

### Get the Docker Image

Docker images for each deployment eliminate dependency issues between
different versions of Azure PowerShell.
1.  Make sure that Docker for Windows is using Windows containers.
2.  Run the following in an elevated command prompt to get the Docker
    container with the deployment scripts.
```    
 docker pull intelligentedge/stageddatasolution:1.0.0
```
### Deploy the Solution

1.  Once the container image has been successfully pulled, start the
    image.
```    
 docker run -it intelligentedge/stageddatasolution:1.0.0 powershell
```
2.  Once the container has started, you will be given an elevated
    PowerShell terminal in the container. Change directories to get to
    the deployment script.
```
 cd .\SDDemo\
```
3.  Run the deployment. Provide credentials and resource names where
    needed. HA refers to the Azure Stack where the HA cluster will be
    deployed, and DR to the Azure Stack where the DR cluster will be
    deployed.

```powershell
.\DeploySolution-Azure-AzureStack.ps1 `
-AzureApplicationId “applicationIDforAzureServicePrincipal” `
-AzureApplicationSercet “clientSecretforServicePrincipal” `
-AzureTenantId “xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx” `
-AzureStackAADTenantName “azurestacktenant.onmicrosoft.com” `
-AzureStackTenantARMEndpoint “https://management.haazurestack.com” `
-AzureStackApplicationId “applicationIDforStackServicePrincipal” `
-AzureStackApplicationSercet “ClientSecretforStackServicePrincipal” `
-AzureStackTenantId “xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx” `
-ResourcePrefix “aPrefixForResources”
```
1.  If prompted; enter a region for the Azure deployment and Application
    Insights
2.  Type “Y” to allow the NuGet provider to be installed, which will
    kick off the API Profile “2018-03-01-hybrid” modules to be installed
    to allow for deployment to Azure and Azure Stack.
3.  Once the resources have been deployed, test that the data will be
    generated for both Azure Stack and Azure.
```    
  .\TDAGenerator.exe
```
4.  See the data being processed by going to the web applications
    deployed to Azure or Azure Stack.

 Azure Web App
 
 ![](.\\stageddata-media\\/media/image2.png)
 
 AzureStack Web App
 
 ![](.\\stageddata-media\\/media/image3.png)

### Next Steps

  - Learn more about hybrid cloud applications, see [Hybrid Cloud
    Solutions.](https://aka.ms/azsdevtutorials)

  - Use your own data or modify the code to this sample on
    [GitHub](https://github.com/Azure-Samples/azure-intelligent-edge-patterns).
