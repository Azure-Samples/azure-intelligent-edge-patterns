#### Kubeflow conflict

We use kubeflow to handle the ML workload in AMLK8s compute, if you have already install kubeflow in your cluster, the add-on install will failed. In the future version, we will compatible will existing kubeflow in your cluster.

####  Node count
The distribute training will need parameter server or launcher, which also occupy one node. So the actual node occupation will equals the run node count plus one. We will place the parameter pod and launcher on the same node with the worker 0 node.

####  Length of Experiment Name
The length of expoeriment name need to less than 15 character now. Otherwise the run will can not be scheduled.

#### Permissions
To attach an AKS cluster, you must be subscription owner or have permission to access AKS cluster resources under the subscription. Otherwise, the cluster list on "attach new compute" page will be blank.

#### AKS spot node pools
Cannot use spot node pools as the spot pool nodes are tainted by default with _kubernetes.azure.com/scalesetpriority=spot:NoSchedule_
Tolerations in profile config is not supported yet that will aloow you to target jobs/pods to the spot node pool
