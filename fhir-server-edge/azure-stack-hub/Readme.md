# Running FHIR Server On Kubernetes

This sample illustrates how to run a FHIR Server instance with SQL Server on Azure Stack Hub using the AKS engine. The below instructions guide through the infrastructure deployment process, the Kubernetes deployment, and deployment validation.


**Recommended Background Reading:**

- [AKS engine on Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-overview?view=azs-2002)

- [Install AKS engine on Linux in Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux?view=azs-2002)

- [Deploy a Kubernetes Cluster with AKS engine on Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-cluster?view=azs-2002)


## Supported FHIR Server Features
- Azure Active Directory integration
- Audit logging with Azure Application Insights
- HHTP/HTTPS protocols (you must provide your own certificate)
- SQL Server backend
- Persistent data storage on Azure Stack Hub Kubernetes deployment using Persistent Volume Claims on Azure Data Disk

## Step 1: Infrastructure Deployment

1. Use [This Guide](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-quick-linux-portal?view=azs-2002) to create a Linux VM in your Azure Stack Hub environment

1. SSH into VM using the public key you created in previous step above

1. Create a service principal for managing AKS engine

    - Follow instructions [here](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-create-service-principals?view=azs-2002) to create and configure app registration in your AD tenant

        - **NOTE:** you will need to have permissions in your Azure Active Directory to create app registration and sufficeint permissions in your Azure Stack Hub environment to add users to your subscription or resource group

    - Be sure to [assign Contributor access](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-create-service-principals?view=azs-2002#assign-a-role) on the resource group / subscription to service principal you created above

1. Install the AKS engine on your VM
    - Follow the instructions [here](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux?view=azs-2002) to install a supported version of the AKS engine

1. Run through [instructions](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-cluster?view=azs-2002) to deploy a cluster with the AKS engine on Azure Stack Hub

    - AKS engine command to create cluster (also provided in referenced instructions above)
        ```
        $ aks-engine deploy \
            --azure-env AzureStackCloud \
            --location <your azure stack region> \
            --resource-group <your resource group> \
            --api-model ./kubernetes-azurestack.json \
            --output-directory FHIR-ASH \
            --client-id <your app registration id> \
            --client-secret <your app client secret> \
            --subscription-id <your azure stack subscription id>
        ```
    ### AKS Engine Troubleshooting

    See this [Troubleshooting Guide](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-troubleshoot?view=azs-2002) for troubleshooting common scenarios on Azure Stack Hub


## Step 2: Helm Chart Deployment

### Environment Definition
- SSH into one of your master nodes

- Clone this repo on the master

- Navigate to this directory in a new Terminal instance (i.e. /samples/k8s)

- Create .env file to match your environment using the .env.template file included here
    - These variables will be used to generate a secret to manage your deployment environment variables
    - Variables to update:
    
        |Environment Variable|Description|
        |--------------------|-----------|
        |FHIR_VERSION | Version of FHIR Server to Run (ex. R4, R5, STU3)|
        |FHIRServer__Security__Authentication__Audience| Audience from your service princpal registration in Azure Active Directory|
        |FHIRServer__Security__Authentication__Authority| Authority from your client app in Azure Active Directory|
        |SAPASSWORD| Password to use for SQL Server service account
        |ApplicationInsights__InstrumentationKey| Instrumentation key for Azure Application Insights to send audit logs|
        |ASPNETCORE_Kestrel__Certificates__Default__Path| Fully qualified path to your certificate|
        |ASPNETCORE_Kestrel__Certificates__Default__Password| Password required to use your certificate|


### Authentication Setup

For authentication to be enabled, the following will need to be setup in you Azure environment 

- Review the FHIR [Roles.md](https://github.com/microsoft/fhir-server/blob/master/docs/Roles.md) documentation to configure and associate roles in Azure 
- [Register the Azure Active Directory apps for Azure API for FHIR](https://docs.microsoft.com/en-us/azure/healthcare-apis/fhir-app-registration)
- [Register a confidential client application in Azure Active Directory](https://docs.microsoft.com/en-us/azure/healthcare-apis/register-resource-azure-ad-client-app).  You also have the option to register by [Public](https://docs.microsoft.com/en-us/azure/healthcare-apis/register-public-azure-ad-client-app) or [Service](https://docs.microsoft.com/en-us/azure/healthcare-apis/register-service-azure-ad-client-app) client.
- [Add app roles in your application and receive them in the token](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps)


### AKS Engine Helm Chart Deployment

- Run the initialize_namespace.sh file here to create the namespace and populate with secrets
    ```
    $ ./initialize_namespace.sh
    ```

- When prompted, provide the requested information
    - Desired namespace name
    - Absolute path to certificate file
    - Desired name for Helm release

- Wait for the deployment to complete
    > NOTE: the deployment will take some time as it needs to pull the container images and run the initial configuration.

## Step 3: Deployment Testing

- Get the External IP of your FHIR Server
    ```
    $ kubectl get services -namespace fhir-server
    ```    

- Follow the guide [here](https://docs.microsoft.com/en-us/azure/healthcare-apis/access-fhir-postman-tutorial) to get a token and test your deployment using Postman
