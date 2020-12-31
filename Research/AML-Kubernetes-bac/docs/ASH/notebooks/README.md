# Distributed Training with Azure Stack Hub Kubernetes Clusters

These samples demonstrate how to perform distributed training using Kubernetes clusters deployed through Azure Stack Hub. 
Both Pytorch and Tensorflow are covered. The training jobs are submitted through Azure Machine Learning Workspace. 
The AML workspace attaches an azure stack hub kubernetes cluster as computational target. The training data are stored
at azure stack storage account. These training data is then configured as dataset in the AML workspaces data store.


   