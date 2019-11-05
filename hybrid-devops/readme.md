# Deploy a Hybrid DevOps Solution
This article describes how to deploy a solution uses Azure Devops and Azure Pipelines agents to deploy resources to Azure and Azure Stack.

In this article you learn how to:

  - Deploy Cloud Native Application Bundles at the edge. To learn about
    CNAB and Porter, [go here](https://porter.sh/).

  - Set up a private Azure DevOps Agent on Azure Stack Hub.

![](./media/image1.png)

Learn more about this solution
[here](https://docs.microsoft.com/en-us/azure-stack/user/hybrid-solution-retail-footfall-detection?view=azs-1908).

## Prerequisites

Before you begin, make sure you have:

  - An Azure Stack Development Kit or Azure Stack Integrated System.
    
      - The Azure Stack should have Azure App Service installed.
    
      - You should have a subscription on the Azure Stack with App
        Service and Storage Quota.

  - An Azure subscription
    
      - If you don't have an Azure subscription, create a free account
        before you begin.

  - A service principal configured for Azure Stack, with access to the Azure Stack
        subscription.
    
      - To learn more about creating service principals, go
        [here](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest#create-a-service-principal).

  - An Azure DevOps organization, with a personal access token that has permission to add agents. To learn more, [go here](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops)


  - The following development resources:
    
      - Azure CLI 2.0
    
      - Docker CE.
    
      - Porter.
    
      - Visual Studio Code.
    
      - Azure IoT Tools for Visual Studio Code.
    
      - Python extension for Visual Studio Code.
    
      - Python

## Get the Code

1.  Clone or download the code.

> <https://github.com/azure-samples/azure-intelligent-edge-patterns>

## Deploy the Cloud Application

Use the Porter CLI to generate a credential set, then deploy the cloud
application.

1.  Porter will generate a set of credentials that will automate
    deployment of the application. You’ll need:
    
    - Azure Stack Service Principal ID
    - Azure Stack Service Principal Key
    - Azure Stack Service Principal Tenant DNS
    - Azure Stack Subscription ID
    - Agent VM Password (must comply with Azure's password requirements.)

2.  Run the credential generation process and follow the prompts.

```
porter creds generate --tag intelligentedge/hybrid-devops-deployment:0.1.0
```
3.  Porter also requires a set of insecure parameters to run. Create a
    text file and enter the following text. Ask your Azure Stack’s
    administrator if you don’t know some of the required values.

> The resource suffix should be a unique string of letters and numbers,
> no longer than 8 characters, to ensure that your deployment’s
> resources have unique names across Azure.

```
azure_stack_tenant_arm="Your Azure Stack Tenant Endpoint"
azure_stack_storage_suffix="Your Azure Stack Storage Suffix"
azure_stack_keyvault_suffix="Your Azure Stack KeyVault Suffix"
resource_suffix="Any unique string here."
azure_location="Any Azure region here."
azure_stack_location="Your Azure Stack’s location identifier here."
azure_devops_url="Your Azure DevOps organization URL here."
pool_name="The name of the agent pool, uses the Default pool by default."
```
Save the text file and make a note of its path.

4.  You’re now prepared to deploy the cloud application with Porter. Run
    the deployment command and watch as resources are deployed to Azure DevOps
    and Azure Stack.
```
porter install hybrid-devops –tag intelligentedge/hybrid-devops-deployment:0.1.0 –creds hybrid-devops-deployment –param-file "path-to-cloud-parameters-file.txt"
```
5.  Once deployment is complete, make a note of the agent's public IP address.

6.  Follow the instructions [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/connect-to-azure?view=azure-devops#create-an-azure-resource-manager-service-connection-with-an-existing-service-principal) to add your Azure Stack environment to Azure DevOps. 


# Remove Your Solution

If you’d like to remove your solution, run the following commands using
Porter, using the same parameter files that you created for deployment.

```
porter uninstall hybrid-devops –tag intelligentedge/hybrid-devops-deployment:0.1.0 –creds hybrid-devops-deployment –param-file "path-to-cloud-parameters-file.txt"

```

# Next Steps

  - Learn more about Azure Stack and the Intelligent Edge, see [here](https://aka.ms/azurestack)

  - Learn more about hybrid cloud applications, see [Hybrid Cloud
    Solutions.](https://aka.ms/hybridpatterns)

  - Modify the code to this sample on
    [GitHub](https://github.com/Azure-Samples/azure-intelligent-edge-patterns).
