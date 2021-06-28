# Deploy Azure Stack Hub’s Kubernetes Cluster as a Compute Cluster in Azure Machine Learning through Azure Arc

In this article, you:

*	Deploy a Kubernetes cluster on Azure Stack Hub
*	Install a preview version of provided Kubernetes Extension
*	Connect Azure Stack Hub’s Kubernetes cluster to Azure via Azure ARC
*	Create an Azure Machine Learning workspace on Azure (if not already deployed)
*	Attach Azure Arc’s Kubernetes cluster as Azure Machine Learning compute target

## Prerequisites

Make sure you have access to Azure and your Azure Stack Hub is ready for use.

You should use the AKS engine for supported Kubernetes clusters on Azure Stack. Please make sure you meet [Azure Stack Hub’s AKS engine requirements](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-set-up?view=azs-2008#prerequisites-for-the-aks-engine). 

To deploy a Kubernetes cluster from the Azure Stack Hub marketplace (This should only be used as a proof of concept. For supported Kubernetes clusters on Azure Stack please use the [AKS engine](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-set-up?view=azs-2008#prerequisites-for-the-aks-engine)):

*	If you are planning on deploying Marketplace Kubernetes using Azure Active Directory (Azure AD) please make sure the following [Prerequisites](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-azuread?view=azs-2008#prerequisites) are met.
*	If you are planning on deploying Marketplace Kubernetes using Active Directory Federated Services please make sure the following [Prerequisites](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-adfs?view=azs-2008#prerequisites) are met.

To connect Azure Stack Hub’s Kubernetes cluster to Azure via Azure ARC please make sure the following [Prerequisites](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/connect-cluster#before-you-begin) are met. Please skip the last requirement (Arc enabled Kubernetes CLI extensions) as you will be installing a private preview of the extension later in this document.

To create an Azure Machine Learning workspace on Azure please make sure the following [Prerequisites](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-manage-workspace?tabs=python#prerequisites) are met (we recommend using the Python SDK when communicating with Azure Machine Learning so make sure the SDK is properly installed). We strongly recommend learning more about [the innerworkings and concepts in Azure Machine Learning](https://docs.microsoft.com/en-us/azure/machine-learning/concept-azure-machine-learning-architecture) before continuing with the rest of this article (optional).

## Deploy a Kubernetes cluster on Azure Stack Hub

First things first, we need to deploy a Kubernetes cluster on Azure Stack Hub. For supported Kubernetes clusters on Azure Stack, please use the AKS engine. Follow the following link to setup your Kubernetes cluster on Azure Stack using the AKS engine:

[What is the AKS engine on Azure Stack Hub?](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-overview?view=azs-2008)

For proof-of-concept deployment you can use Kubernetes Cluster in your Azure Stack Hub Marketplace. You can either use Azure Active Directory (Azure AD) or Active Directory Federated Services for deployment of a Kubernetes cluster using Azure Stack Marketplace:

*	Using Azure Active Directory (Azure AD): Please follow the [instructions here](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-azuread?view=azs-2008)
*	Active Directory Federated Services: Please follow the [instructions here](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-adfs?view=azs-2008)

If you do not have Kubernetes Cluster in your marketplace, please talk to your Azure Stack Hub administrator. **Please Note:** As mentioned before only use the Kubernetes Azure Stack Marketplace item to deploy clusters as a proof-of-concept. For supported Kubernetes clusters on Azure Stack, use [the AKS engine](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-overview?view=azs-2008).

**IMPORTANT: For either approach (Marketplace and AKS engine) make sure to create a [supported version of Kubernetes](https://docs.microsoft.com/en-us/azure/aks/supported-kubernetes-versions#kubernetes-version-support-policy) before continuing forward.**

## Connect Azure Stack Hub’s Kubernetes cluster to Azure via Azure ARC

We start the process of connecting our newly created Kubernetes cluster to Azure by installing the most recent Arc enabled Kubernetes CLI extensions (private preview). Follow the instructions below to install the required extensions and connect your newly created cluster to Azure az an Azure Arc Cluster:

*	Make sure the system that you are using to install CLI extensions has access to your cluster, cluster-admin role and, Azure. For more information please read [Before you Begin](https://docs.microsoft.com/en-in/azure/azure-arc/kubernetes/connect-cluster#before-you-begin). 
*   Follow the instructions given in the Pre-requisites section of [this repository](https://github.com/Azure/azure-arc-kubernetes-preview/blob/master/docs/k8s-extensions.md#pre-requisites) to install preview extensions and connect your cluster to Azure via Azure ARC.

## Attach Azure Arc’s Kubernetes cluster as Azure Machine Learning compute target

If you do not already have an Azure Machine learning workspace in your desired Azure resource group, please [create your Machine learning workspace](https://docs.microsoft.com/en-us/azure/machine-learning/concept-workspace#-create-a-workspace). You can then attach Azure Arc’s Kubernetes cluster to your workspace through Azure Machine Learning’s Python SDK:

### Python SDK:

1. Install private preview branch of AzureML SDK by running following command:

    ```pip install --disable-pip-version-check --extra-index-url https://azuremlsdktestpypi.azureedge.net/azureml-contrib-k8s-preview/D58E86006C65 azureml-contrib-k8s```

2. Make sure your Azure Machine Learning workspace is defined/loaded in your python environment. If not, you can load your workspace using Workspace class:
    
    ```python 
    from azureml.core import Workspace 
    
    ws = Workspace.from_config(path = "<PATH TO CONFIG FILE>")
    ws.get_details()
    ```
    ‘from_config’ method reads JSON configuration file that tells SDK how to communicate with your Azure Machine Learning workspace. If needed, [create a workspace JSON configuration file](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-configure-environment#workspace) before running the snippet above.

3. Attach/Register Azure Arc’s Kubernetes cluster as Azure Machine Learning compute target by running the following python code snippet:
    
    ```python 
    from azureml.contrib.core.compute.arckubernetescompute import ArcKubernetesCompute
   
    attach_config = ArcKubernetesCompute.attach_configuration(
    cluster_name="<arc-cluster-name>",
    resource_group="<resource-group>",
    resource_id="<arc-cluster-resource-id>")
    
    arcK_target = ArcKubernetesCompute.attach(ws, "arcK-ash", attach_config)
    arcK_target.wait_for_completion(show_output= True)
    ```

4. If the attachment is successful, “SucceededProvisioning operation finished, operation "Succeeded"” message will be printed as a result. This means that we have successfully attached the Arc Cluster as a compute target named “arcK-ash” in your Azure Machine Learning workspace. 


## Next Steps

Learn how to [Setup Azure Stack Hub's Blob Storage as a Datastore on Azure Machine Learning Workspace and Run a Training Workload](Train-AzureArc.md).
