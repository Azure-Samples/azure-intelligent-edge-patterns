# ML on Azure Stack using Kubeflow

This Lab guides you through the steps needed to conduct ML operations using Kubeflow on Azure Stack.

## Prerequisites

1. Have a valid Microsoft Azure Stack subscription
2. Docker client
3. Azure CLI
4. Git CLI

Clone this repository somewhere so you can easily access the different source files:

    git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git

## Table of content

| | Module | Description and milestones |
| --- | --- | --- |
| Lab0 | **[Introduction and installation of Kubeflow on Azure Stack](00-Intro/Readme.md)** | |
|    | [Pre-requisite setup](#Module-01-Pre-requisite-setup) | Check-point: work machine, git, web browser, terminal |
|    | [Azure Stack](#Module-02-Azure-Stack) | Check-point: Azure Stack Portal, cloud shell, Azure CLI |
|    | [AKS-E](#Module-03-Kubernetes) | Check-point: aks-e |
|    | [Kubernetes](#Module-03-Kubernetes) | Check-point: Kubernetes, kubectl |
|    | [Docker](#Module-04-Docker) | Check-point: docker containers |
|    | [DockerHub](#Module-05-DockerHub) | Check-point: dockerhub as container artifactory |
|    | [Persistence on Azure Stack](#Module-06-Persistence-on-Azure-Stack) | Check-point: cross-node file storage |
|    | [kfctl](#Module-07-Kubeflow) | Check-point: kfctl |
|    | [Kubeflow](#Module-07-Kubeflow) | Check-point: Kubeflow installation, kfctl |
|    | [Kubeflow Dashboard](#Module-08-Kubeflow-Dashboard) | Check-point: Kubeflow Dashboard, namespaces |
|    | [GPU](#Module-14-GPU) | Check-point: GPU-facilitated operations |
|    | [Using Models](#Module-15-Using-Models) | Check-point: into to pipelines |
|    | [Uninstalling Kubeflow](#Module-16-Uninstalling-Kubeflow) | Check-point: clean environment |
| Lab1 | **[Create and use jupyter hub with sample notebook to train and inference on 1 node](01-Jupyter/Readme.md)** | |
|    | [Jupyter Server](#Module-09-Jupyter-Servers-and-Notebooks) | Check-point: Jupyter server, web terminal |
|    | [Jupyter Notebook](#Module-09-Jupyter-Servers-and-Notebooks) | Check-point: Jupyter Notebook |
|    | [ML with Python](#Module-10-ML-with-Python) | Check-point: Python programming, PyTorch and Tensorflow |
|    | [TensorBoard](#Module-13-Tensorboard) | Check-point: TensorBoard |
|    | [k8s Dashboard access](#Module-03-Kubernetes) | Check-point: Kubernetes Dashboard |
| Lab2 | **[Distributed training using TF Jobs](02-TFJobs/Readme.md)** | |
|    | [TFJobs](#Module-11-TFJobs) | Check-point: TFJob |
| Lab3 | **[Distributed training using Pytorch Jobs](03-PyTorchJobs/Readme.md)** | |
|    | [PyTorchJobs](#Module-12-PyTorchJobs) | Check-point: PyTorchJob |
| Lab4 | **[Serving models with KF Serving](04-KFServing/Readme.md)** | |
| Lab5 | **[Create an end to end pipeline that train with TF Jobs and deploy on cluster](05-Pipelines/Readme.md)** | |
| Lab6 | **[Hyperparameter tuning with Katib](06-Katib/Readme.md)** | |

---

# Links

- https://docs.microsoft.com/en-us/azure-stack - Azure Stack web page
- https://github.com/Azure/kubeflow-labs - similar lab for Azure
- https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart - Cloud shell into
- https://docs.microsoft.com/en-us/azure/aks/gpu-cluster - GPU-related configuration using AKS
- https://docs.microsoft.com/en-us/azure-stack/asdk/asdk-install
- https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux
- https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-cluster
- https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/AKSe-on-AzStackHub - AKSe
- https://github.com/Azure/aks-engine/blob/master/docs/topics/azure-stack.md#known-issues-and-limitations Known Issues and Limitations
- https://ubuntu.com/tutorials/ubuntu-on-windows - Ubuntu on Windows10

