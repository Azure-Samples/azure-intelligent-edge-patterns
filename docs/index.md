---
title: How to run Jupyter Notebooks in your workspace to deploy on edge
titleSuffix: Azure Machine Learning on Edge
description: Learn how run a Jupyter Notebook without leaving your workspace in Azure Machine Learning studio.
services: machine-learning
author: mahesh yadav(yadavm)
ms.author: mahesh yadav(yadavm)
ms.reviewer: kundana
ms.service: machine-learning, Azure Edge
ms.subservice: core
ms.topic: conceptual
ms.custom: how-to
ms.date: 09/02/2020
# As a data scientist, I want to run Jupyter notebooks in my workspace in Azure Machine Learning studio and deploy to my AS edge device with accleration
---

# How to run Jupyter Notebooks in your workspace


Learn how to run your Jupyter Notebooks directly in your workspace in Azure Machine Learning studio. While you can launch [Jupyter](https://jupyter.org/) or [JupyterLab](https://jupyterlab.readthedocs.io), you can also edit and run your notebooks without leaving the workspace.

See how you can:

* Create Jupyter Notebooks in your workspace
* Run an experiment from a notebook
* Change the notebook environment
* Find details of the compute instances used to run your notebooks


## Prerequisites

* An Azure subscription. If you don't have an Azure subscription, create a [free account](https://aka.ms/AMLFree) before you begin.
* A Machine Learning workspace. See [Create an Azure Machine Learning workspace](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-manage-workspace).
* A Azure Stack Edge device ready with compute deployed,  [getting started on AS Edge ](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-sample-module-marketplace)
* Create a VM with GPU and Iot Edge installed follow instruction here to create VM with GPU, driver, nvidia docker [learn more](https://github.com/MSKeith/iotedge-vm-deploy),ARM template to deploy a GPU enabled VM with IoT Edge pre-installed (via cloud-init)

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FMSKeith%2Fiotedge-vm-deploy%2Fmaster%2FedgeDeploy.json" target="_blank">
    <img src="https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.png" />
</a>

## <a name="create"></a> Create notebooks

In your Azure Machine Learning workspace, create a new Jupyter notebook and start working. The newly created notebook is stored in the default workspace storage. This notebook can be shared with anyone with access to the workspace.




