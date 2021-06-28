# Azure Stack Edge Setup 

The following are instructions on how to set up your Azure Stack Edge to deploy this solution. 

## Prerequisites

### Hardware Prerequisites   
For these steps to be successful, the following prerequisites must be met:

- A Microsoft Azure Subscription
- A Microsoft Azure Stack Edge Pro (one or two GPU)
   - You can order directly from the Azure Portal [https://aka.ms/databox-edge](https://aka.ms/databox-edge)
_Note: The FPGA version of the Azure Stack Edge appliance will NOT be compatible with this solution due to the lack of Kubernetes support._ 

### Software Prerequisites
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Bash Command such as [GitBash](https://git-scm.com/downloads)

## Setup

1. Follow installation steps 0 through 8 of the [Microsoft Online documentation](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-checklist).

   _Note: The Installation of internally issued certificates are not required, but highly recommended._

2. Ensure the Azure Stack Edge appliance is fully up to date with [the latest runtime](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-install-update).

## Configure Kubernetes & Create Namespace and User

Once the Azure Stack Edge appliance is configured and operational, a unique namespace with associate credentials must be configured.

Microsoft always publishes up to date documentation that should be considered the authoritative source for all Azure Stack Edge configurations. Please follow [these instructions to create your Kubernetes cluster](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-create-kubernetes-cluster)

Upon completing the creation of the namespace and user for the Azure Stack Edge, you should have a config file that will be used to access your kubernetes cluster. 

_Note: The `aseuser` account provided on the ASE dashboard is read only. This will work for viewing the dashboard, but for kubectl and helm commands you will want to use this new user. Using `aseuser` for dashboard access is recommended for saftey._

## Access Your Kubernetes Cluster

For this last section, you will need the config file that was created when you created your user and namespace. These commands should be run in your bash command tool of your choice (for Windows users, consider GitBash). 

1. Navigate to root directory with bash command tool.
  
2. Place the config file you saved during the ASE and Kubernetes set up to ~/.kube/config.
   - First, make sure there is not an existing config file. To do this, run the following bash command  
   `ls -la ~/.kube/`  
   Expected output: _Cannot access "filename": No such file or directory_  
     
   - Then, copy your config file to ~/.kube/config location by running the following bash command  
    `cp <your file location> ~/.kube/config # Copy the config`  

    _Note: If you get an error ```ls: cannot create regular file '... /.kube/config: no such file or directory```, verify that you have kubectl set up correctly. This includes creating the .kube directory_  
  
3. Set your namespace.
   - Run the following bash command - make sure to replace the placeholder text with the namespace you created when configuring your Kubernetes  
     `kubectl config set-context --current --namespace=<your namespace name>`  
  
4. Test connectivity.
   - Verify that the kubectl commands are recognized by running the following bash command :

    `kubectl get deployments`  

   Expected output: ```No resources found in "YourNamespace" namespace```  
   This shows that you have connected and authenticated to Kubernetes.  
  
Device setup is complete once the device has been configured and you are able to connect via `kubectl`.  

## Next Steps  
Step 2 of recommended set up - [Deploy cloud services in Azure Public](./azure-cloud-services/README.md)  
Or return to our [root level README](./README.md) to review other options