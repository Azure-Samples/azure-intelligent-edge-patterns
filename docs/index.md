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
[!INCLUDE [applies-to-skus](../../includes/aml-applies-to-basic-enterprise-sku.md)]

Learn how to run your Jupyter Notebooks directly in your workspace in Azure Machine Learning studio. While you can launch [Jupyter](https://jupyter.org/) or [JupyterLab](https://jupyterlab.readthedocs.io), you can also edit and run your notebooks without leaving the workspace.

See how you can:

* Create Jupyter Notebooks in your workspace
* Run an experiment from a notebook
* Change the notebook environment
* Find details of the compute instances used to run your notebooks

## Prerequisites

* An Azure subscription. If you don't have an Azure subscription, create a [free account](https://aka.ms/AMLFree) before you begin.
* A Machine Learning workspace. See [Create an Azure Machine Learning workspace](how-to-manage-workspace.md).
* A Azure Stack Edge device ready with compute deployed Getting [started on AS Edge ](https://databoxupdatepackages.blob.core.windows.net/documentation/Microsoft-Azure-Stack-Edge-GPU-IoT-K8-20200615.pdf)
* Create a VM with GPU and Iot Edge install follow instruction here to create VM with GPU, driver, nvidia docker 
