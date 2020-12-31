## Create/provision AKS cluster
To enable AMLK8S, you will need to first provision an AKS (CPU/GPU) cluster, your can create a AKS via 
1. [Azure CLI](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)
2. [Azure PowerShell](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-powershell)
3. [Azure Portal](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal)
4. [Using ARM template](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-rm-template) 

You can refer [AKS documents](https://docs.microsoft.com/en-us/azure/aks/) to get more detailed informantion.

### Limitations

1. _The AML service requires the AKS cluster to have unrestricted inbound and outbound access. We need inbound access to reviece the requests from AML core servies, and we will create a pubilc ip for our rest server which NSG only allow traffic with AML service tag. We also need the outbound access to report the metrics and artifacts to AML core service_
1. _Private AKS clusters are NOT supported_
1. _AKS clusters with Authorized IP ranges are NOT supported_

### GPU VM size's in Azure
In Azure the VM size begining with "N" indicate this VM is a GPU SKU, and you can find detail GPU VM size at: https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-gpu

#### Currently, AKS supports the NC and ND series of GPU's. You can view the list of supported GPU's when you create an AKS cluster in the portal and view all SKU's supported when you select 'Change Size' in the Node Size picker.

After you create an AKS cluter, for the next step you can go to [attach Kubernetes cluster to an AML workspace](https://github.com/Azure/CMK8s-Samples/blob/master/docs/2.%20Attach%20CMAKS%20compute.markdown).

We use AML add-on to bring your AKS cluster to AML workspace, if you want to know more detail about AML add-on, please goto [managed AML add-on](https://github.com/Azure/CMK8s-Samples/blob/master/docs/5.%20Manage%20AML%20add-on.markdown)
