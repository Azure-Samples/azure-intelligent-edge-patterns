# ML on Azure Stack using Kubeflow

This Lab guides you through the steps needed to conduct ML operations using Kubeflow on Azure Stack.

## Prerequisites

1. Have a valid Microsoft Azure Stack subscription
2. Docker client
3. Azure CLI
4. Git CLI

Clone this repository somewhere so you can easily access the different source files:

    $ git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git

## Table of content

| | |
| --- | --- |
| Lab0 | [Introduction and installation of Kubeflow on Azure Stack](00-Intro/Readme.md) |
| Lab1 | [Create and use jupyter hub with sample notebook to train and inference on 1 node](01-Jupyter/Readme.md) |
| Lab2 | [Distributed training using TF Jobs](02-TFJobs/Readme.md) |
| Lab3 | [Distributed training using Pytorch Jobs](03-PyTorchJobs/Readme.md) |
| Lab4 | [Serving models with KF Serving](04-KFServing/Readme.md) |
| Lab5 | [Create an end to end pipeline that train with TF Jobs and deploy on cluster](05-Pipelines/Readme.md) |
| Lab6 | [Hyperparameter tuning with Katib](06-Katib/Readme.md) |

## Links

- https://docs.microsoft.com/en-us/azure-stack - Azure Stack web page
- https://ubuntu.com/tutorials/ubuntu-on-windows - Ubuntu on Windows10
