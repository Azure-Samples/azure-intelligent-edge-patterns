### Supported Distributions (Cloud Native Computing Foundation (CNCF) certified Kubernetes clusters)
1. [AKS - Engine](https://github.com/Azure/aks-engine/blob/master/docs/tutorials/quickstart.md)
2. [GKE](https://console.cloud.google.com/kubernetes)
3. Azure Stack Hub - TBD

## DO NOT USE Azure Arc public docs to connect to a kubernetes cluster (as it does not include Arc extensions functionality)

Instead follow [repo](https://github.com/Azure/azure-arc-kubernetes-preview/blob/master/docs/k8s-extensions.md)  here to Connect to a cluster

There are 2 steps in the repo above
1. Install the Arc agent on the cluster aka 'connectedk8s'(in public preview)
2. Enable the Arc extensions frameowrk aka 'k8s-extension' (in private preview)

#### GKE specifics 
1. Select Ubuntu OS image during cluster create
1. A minimum of 3 nodes is required; need enough resources for arc agent and amlk8s agent installation 
1. DO NOT select smaller VM's than 'medium' size 

GKE console -> +Create Cluster -> Node Pools -> Default-pool -> Nodes
![GKEClusterCreate](/docs/media/gkecreate.png)
