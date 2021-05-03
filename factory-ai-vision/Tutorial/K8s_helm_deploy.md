# Deploy Vision on Edge solution on AKS and AKS-HCI Using our Helm chart

Kubernetes provides a distributed platform for containerized applications. In this tutorial, you will learn how to deploy Vision on Edge solution to an Azure Kubernetes Service (AKS) cluster on the cloud or Azure Stack HCI (AKS-HCI).

## Prerequisites

Before you start, you would need an Azure subscription. If you don't have an Azure subscription, you can create one for free on the  [Azure sign-up page](https://aka.ms/createazuresubscription).

This article assumes that you have an existing AKS/AKS-HCI cluster deployed and have access to the cluster using `kubectl` command (more information [here](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/#accessing-for-the-first-time-with-kubectl)). If you need an AKS/AKS-HCI cluster, Please see the following documentation to create your desired cluster:

- AKS:  
  - [Create using the Azure CLI](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/aks/kubernetes-walkthrough.md) or 
  - [Create using the Azure portal](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/aks/kubernetes-walkthrough-portal.md)
- AKS-HCI (recommended for edge deployment): 
  - [Create using PowerShell](https://docs.microsoft.com/en-us/azure-stack/aks-hci/kubernetes-walkthrough-powershell) or
  - [Create using Windows Admin Center](https://docs.microsoft.com/en-us/azure-stack/aks-hci/setup) 
  - If you don't have access to an Azure Stack HCI and would still like to evaluate AKS-HCI please follow [this evaluation guide](https://github.com/Azure/aks-hci/tree/main/eval) that deploys AKS-HCI inside of an Azure VM.

You need the Azure CLI version 2.0.59 or later installed and configured. Run `az --version` to find the version. If you need to install or upgrade, see [Install Azure CLI](https://github.com/MicrosoftDocs/azure-docs/blob/master/cli/azure/install-azure-cli).

Lastly, the device that you are using to deploy VoE needs to have the latest version Helm installed. If you don't have helm installed, you can do so by following the [instructions here](https://helm.sh/docs/intro/install/). 

## Deploy/Configure Required Azure Resources
### IoT Hub
### Custom Vision

## Deploy VoE onto AKS/AKS-HCI

