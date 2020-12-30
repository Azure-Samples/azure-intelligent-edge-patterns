Select Azure Arc Kubernetes cluster instead of AKS cluster and follow same steps as AKS

![arcattach](/docs/media/arcattach.png)

# For GKE 

Once the installation is complete, you need to SSH into each node in your cluster, and execute the following commands: 

[Utility tool to ssh into kubernetes nodes](https://github.com/kvaps/kubectl-node-shell)

```bash
sudo ln -s /etc/kubernetes/volumeplugins/azure~blobfuse /home/kubernetes/flexvolume/

sudo apt-get update; sudo apt-get install –y jq

wget https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb; sudo dpkg -i packages-microsoft-prod.deb; sudo apt-get update; sudo apt-get install blobfuse
``` 

## Attach Arc Kubernetes cluster using SDK
To attach Arc Kubernetes compute you need install private branch SDK

### Install private branch SDK
```
pip install --disable-pip-version-check --extra-index-url https://azuremlsdktestpypi.azureedge.net/azureml-contrib-k8s-preview/D58E86006C65 azureml-contrib-k8s
```

### Set up WS configuration
```
from azureml.core.workspace import Workspace

ws = Workspace.from_config()
print('Workspace name: ' + ws.name, 
      'Azure region: ' + ws.location, 
      'Subscription id: ' + ws.subscription_id, 
      'Resource group: ' + ws.resource_group, sep='\n')
```      

### Attach Arc Kubernetes compute compute via SDK
```python
from azureml.contrib.core.compute.arckubernetescompute import ArcKubernetesCompute

k8s_config = {
}

attach_config = ArcKubernetesCompute.attach_configuration(
    #cluster_name="andress-aks-engine-arc",
    #resource_group="andress-eastus",
    resource_id="/subscriptions/5abfd9c4-ec8c-4db9-acd4-c762dce93508/resourceGroups/aks-eng-rg/providers/Microsoft.Kubernetes/connectedClusters/arcAksE",
    aml_k8s_config=k8s_config
)

arc_target = ArcKubernetesCompute.attach(ws, "saurya-arc", attach_config)
arc_target.wait_for_completion(show_output=True)
```

### Detach Arc Kubernetes compute via SDK
```
cmaks_target.detach()
```
