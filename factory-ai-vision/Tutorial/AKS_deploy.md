

# Quickstart: Deploy factory-ai solution on Azure Kubernetes Service (AKS) 
Kubernetes provides a distributed platform for containerized applications. With AKS, you can quickly create a production ready Kubernetes cluster. In this tutorial, you will learn how to deploy factory-ai solution to an Azure Kubernetes Service (AKS) cluster.

## Prerequisites
Before you start, you would need an Azure subscription. If you don't have an Azure subscription, you can create one for free on the  [Azure sign-up page](https://aka.ms/createazuresubscription).

This article assumes that you have an existing AKS cluster. If you need an AKS cluster, see the AKS quickstart [using the Azure CLI](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/aks/kubernetes-walkthrough.md) or [using the Azure portal](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/aks/kubernetes-walkthrough-portal.md).

You also need the Azure CLI version 2.0.59 or later installed and configured. Run `az --version` to find the version. If you need to install or upgrade, see [Install Azure CLI](https://github.com/MicrosoftDocs/azure-docs/blob/master/cli/azure/install-azure-cli).

## Connect to cluster using kubectl

To configure `kubectl` to connect to your Kubernetes cluster, use the `az aks get-credentials` command. The following example gets credentials for the AKS cluster named *myAKSCluster* in the *myResourceGroup*:
```azurecli
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
```
To verify the connection to your cluster, run the `kubectl get nodes` command to return a list of the cluster nodes:
```
$ kubectl get nodes

NAME                                STATUS   ROLES   AGE     VERSION
aks-nodepool1-37463671-vmss000000   Ready    agent   2m37s   v1.18.10
aks-nodepool1-37463671-vmss000001   Ready    agent   2m28s   v1.18.10
```



## Create an Azure file share
Since *rtspsim* and *uploadmodule* requires to mount a Docker volume, we need to create an Azue file share as a Kubernetes volume.
Before you can use Azure Files as a Kubernetes volume, you must create an Azure Storage account and the file share. The following commands create a resource group named *myAKSShare*, a storage account, and a Files share named *uploadvolume*:
```
# Change these four parameters as needed for your own environment
AKS_PERS_STORAGE_ACCOUNT_NAME=mystorageaccount$RANDOM
AKS_PERS_RESOURCE_GROUP=myAKSShare
AKS_PERS_LOCATION=eastus
AKS_PERS_SHARE_NAME=uploadvolume

# Create a resource group
az group create --name $AKS_PERS_RESOURCE_GROUP --location $AKS_PERS_LOCATION

# Create a storage account
az storage account create -n $AKS_PERS_STORAGE_ACCOUNT_NAME -g $AKS_PERS_RESOURCE_GROUP -l $AKS_PERS_LOCATION --sku Standard_LRS

# Export the connection string as an environment variable, this is used when creating the Azure file share
export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string -n $AKS_PERS_STORAGE_ACCOUNT_NAME -g $AKS_PERS_RESOURCE_GROUP -o tsv)

# Create the file share
az storage share create -n $AKS_PERS_SHARE_NAME --connection-string $AZURE_STORAGE_CONNECTION_STRING

# Get storage account key
STORAGE_KEY=$(az storage account keys list --resource-group $AKS_PERS_RESOURCE_GROUP --account-name $AKS_PERS_STORAGE_ACCOUNT_NAME --query "[0].value" -o tsv)

# Echo storage account name and key
echo Storage account name: $AKS_PERS_STORAGE_ACCOUNT_NAME
echo Storage account key: $STORAGE_KEY
```


## Create a Kubernetes secret

Kubernetes needs credentials to access the file share created in the previous step. These credentials are stored in a [Kubernetes secret][kubernetes-secret], which is referenced when you create a Kubernetes pod.

Use the `kubectl create secret` command to create the secret. The following example creates a secret named *azure-secret* and populates the *azurestorageaccountname* and *azurestorageaccountkey* from the previous step. To use an existing Azure storage account, provide the account name and key.
```
kubectl create secret generic azure-secret --from-literal=azurestorageaccountname=$AKS_PERS_STORAGE_ACCOUNT_NAME --from-literal=azurestorageaccountkey=$STORAGE_KEY
```

Also, IotHub/Edge credential is required in factory-ai solution.
```
echo "IOTHUB_CONNECTION_STRING=$(az iot hub connection-string show --hub-name <your_iothub_name> -o tsv)" > .az.env
echo "IOTEDGE_DEVICE_CONNECTION_STRING=$(az iot hub device-identity connection-string show --hub-name <your_iothub_name> --device-id <your_edge_device_name> -o tsv)" > .az.env
kubectl create secret generic azure-env --from-env-file ./.az.env
```



## Create an AKS cluster

If you need an AKS cluster that meets the minimum requirements (at least **2 GPU-enabled nodes** and Kubernetes version 1.10 or later), complete the following steps. If you already have an AKS cluster that meets these requirements, [skip to the next section](#install-nvidia-device-plugin).

First, create a resource group for the cluster using the `az group create` command. The following example creates a resource group name *myResourceGroup* in the *eastus* region:

```azurecli-interactive
az group create --name myResourceGroup --location eastus
```

Now create an AKS cluster using the `az aks create` command. The following example creates a cluster with a single node of size `Standard_NC6`:

```azurecli-interactive
az aks create \
    --resource-group myResourceGroup \
    --name myAKSCluster \
    --node-vm-size Standard_NC6 \
    --node-count 3
```


## Install NVIDIA device plugin
Before installation, make sure that you have a AKS cluster with GPU-enabled node.

Get the credentials for your AKS cluster using the `az aks get-credentials` command:

```azurecli-interactive
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
```

Before the GPUs in the nodes can be used, you must deploy a DaemonSet for the NVIDIA device plugin. This DaemonSet runs a pod on each node to provide the required drivers for the GPUs.

First, create a namespace using the `kubectl create namespace` command, such as *gpu-resources*:

```
kubectl create namespace gpu-resources
```

Download the YAML manifest named *nvidia-device-plugin-ds.yaml* with `wget` command: 
```
wget https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/develop/factory-ai-vision/EdgeSolution/nvidia-device-plugin-ds.yaml
```
This manifest is provided as part of the [NVIDIA device plugin for Kubernetes project](https://github.com/NVIDIA/k8s-device-plugin).


Now use the `kubectl apply` command to create the DaemonSet and confirm the NVIDIA device plugin is created successfully, as shown in the following example output:

```
$ kubectl apply -f nvidia-device-plugin-ds.yaml

daemonset "nvidia-device-plugin" created
```

## Deploy factory-ai solution on Azure Kubernetes Service
After all the settings above, you can now deploy factory-ai solution on AKS with the deployment template.
Deployment templates:
- [CPU](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/develop/factory-ai-vision/EdgeSolution/deployment.k8s.cpu.template.yml)
- [GPU](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/develop/factory-ai-vision/EdgeSolution/deployment.k8s.gpu.template.yml)


Download the deployments above with `wget` command:
```
wget -O deployment.k8s.cpu.template.yml https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/develop/factory-ai-vision/EdgeSolution/deployment.k8s.cpu.template.yml
```
Now use the following `kubectl apply` command to deploy factory-ai solution:
```
kubectl apply -f deployment.k8s.cpu.template.yml
```

After deployment, you can check the pods on your AKS cluster with `kubectl get pods` command:
```
$ kubectl get pods

NAME                                   READY   STATUS      RESTARTS   AGE
cvcapturemodule-686fb779f6-nct7b       1/1     Running     0          22h
inferencemodule-864c499969-5sdbv       1/1     Running     0          22h
nginxmodule-7d7b9c84dd-6mtkx           1/1     Running     0          22h
predictmodule-67bfcf946c-86npc         1/1     Running     0          22h
rtspsim-79f7894dd9-krnxn               1/1     Running     0          22h
uploadmodule-74c6b99d49-vnxwv          1/1     Running     0          22h
webmodule-6cb85f46f8-2r8f5             1/1     Running     0          22h
yolov4module-6b884cd9c-swtd6           1/1     Running     0          22h
```


## Get factory-ai solution endpoint
After deployment, you can use `kubectl get service` to get the endpoint of factory-ai solution.
```
$ kubectl get service

NAME              TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)          AGE
cvcapturemodule   ClusterIP      10.0.33.155    <none>         9000/TCP         22h
inferencemodule   ClusterIP      10.0.252.17    <none>         5000/TCP         22h
nginxmodule       LoadBalancer   10.0.2.203     20.190.1.246   8181:32640/TCP   22h
predictmodule     ClusterIP      10.0.246.117   <none>         7777/TCP         22h
rtspsim           ClusterIP      10.0.189.4     <none>         554/TCP          22h
uploadmodule      ClusterIP      10.0.183.60    <none>         7000/TCP         22h
webmodule         ClusterIP      10.0.66.3      <none>         8000/TCP         22h
yolov4module      ClusterIP      10.0.134.119   <none>         80/TCP           22h
```

According to the output on terminal, you can use the *EXTERNAL-IP* and *PORT* to access the factory-ai solution.
From the example above, the endpoint would be *http://20.190.1.246:8181*

