# Object Segmentation: Pipeline Run Training and Serving with  Azure Stack Hub Kubernetes Clusters and ASH storage

Using Object Segmentation as an example, this sample notebook demonstrates how to run [Azure Machine Learning Pipelines](https://aka.ms/aml-pipelines) with Arc compute
and Azure Stack storage. Data are stored in AML datastore backed by Stack storage blobs, are processed by Arc compute as well. Training step is also done by Arc compute. Three kinds of servings are demonstrated: with Azure Stack kubernetes clusters through KFServing, Azure 
Kubernetes clusters or local computers.

## Notebooks

* [Object Segmentation with ASH Cluster and Storage](object_segmentation-ash.ipynb)
* [Serving with ASH cluster and KFServing](object_segmentation_kfserving.ipynb)




   