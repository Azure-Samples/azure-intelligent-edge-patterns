
## Attach kubernetes compute from UI

1. Goto AML studio [portal](https://ml.azure.com), Compute > Attached compute, click "+New" button, and select "Kubernetes service (Preview)"

![addKubernetesCompute](/docs/media/addKubernetesCompute.png)

1. Enter a compute name and check 'Azure Kubernetes service' radio button. In the dropdown below, you should see all your AKS clusters in that subscription. Select the cluster you want to attach to this AML workspace

![listAKS](/docs/media/listAKS.png)


1. (Optional) Browse & upload a profile config file
   * A profile config is a YAML file that defines a namespace and/or node selctors to which the data scientist is set up to deploy training jobs
   * If you skip this section, all jobs/pods will be deployed to the default namespace
   * Profile config schema is captured [here](/docs/profile-config/profile-schema-v1.0.yaml)
   * Profile config sample can be found [here](/docs/profile-config/profile-v1.0-sample-1.yaml)
   * #### It is expected that the IT operator sets up the kubernetes namespaces/node selectors, otherwise the jobs/pods will be deployed in the default namespace

![profileConfig](/docs/media/profileConfig.png)

1. Click 'Attach' button. You will see the 'provisioning state' as 'Creating'. If it succeeds, you will see a 'Succeeded' state or else 'Failed' state. The attach process takes about ~5 mins
![attach](/docs/media/attach.png)


### Detach compute from UI
1. Go to compute list and then Compute Details, click on Detach and confirm.
![detach](/docs/media/detach.png)


## Attach AKS compute using SDK
To attach AKS cluster you need install private branch SDK

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

### Attach AKS cluster compute via SDK
```python
from azureml.contrib.core.compute.cmakscompute import CmAksCompute

k8s_config = {
    "namespace": "testnamespace",
    "nodeSelector": {
        "sku": "P100",
        "env": "prod"
    }
}

attach_config = CmAksCompute.attach_configuration(
    #cluster_name="andress-cmaks-test-001",
    #resource_group="andress-eastus",
    resource_id="/subscriptions/5f08d643-1910-4a38-a7c7-84a39d4f42e0/resourceGroups/andress-eastus" \
      + "/providers/Microsoft.ContainerService/managedClusters/andress-cmaks-test-001",
    aml_k8s_config=k8s_config
)

cmaks_target = CmAksCompute.attach(ws, "andress-cmaks", attach_config)
cmaks_target.wait_for_completion(show_output=True)
```

### Detach CMAKS compute via SDK
```
cmaks_target.detach()
```



<!--
## Attach/Detach compute from CLI
### Install azure-cli-extension private branch
- Firstly, use  ```az extension remove -n azure-cli-ml ``` command to remove the previous extension. 
- Secondly, use the following command to install extension
```
az extension add --source https://azuremlsdktestpypi.blob.core.windows.net/wheels/AzureML-ITP-CLI/24196246/azure_cli_ml_private_preview-0.1.0.24196246-py3-none-any.whl --pip-extra-index-urls https://azuremlsdktestpypi.azureedge.net/AzureML-ITP-CLI/24196246 --yes --debug
```

### Attach CMAKS compute via CLI
Parameters are not same as [az ml computetarget attach](https://docs.microsoft.com/en-us/cli/azure/ext/azure-cli-ml/ml/computetarget/attach?view=azure-cli-latest#ext-azure-cli-ml-az-ml-computetarget-attach-aks), we also need to specify the cluster nood pool name.
```
az ml computetarget attach akscompute --compute-target-name mycmaks --aks-cluster-name myakscluster --aks-resource-group myresourcegroup --node-pool-name agentpool --workspace-name myworkspace --workspace-resource-group myresourcegroup --subscription-id mysubscriptionid -v
```

### Detach CMAKS compute via CLI
```
az ml computetarget detach akscompute --name mycmaks --workspace-name myworkspace --resource-group myresourcegroup --subscription-id mysubscriptionid -v
```
-->
