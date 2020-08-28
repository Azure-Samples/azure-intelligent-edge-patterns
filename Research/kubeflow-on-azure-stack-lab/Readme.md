# ML on Azure Stack using Kubeflow

This section guides you through the steps needed to conduct ML operations using Kubeflow on Azure Stack.

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
| 00-Intro | [Introduction and installation of Kubeflow on Azure Stack](00-Intro/Readme.md) |
| 01-Jupyter | [Create and use jupyter hub with sample notebook to train and inference on 1 node](01-Jupyter/Readme.md) |
| 02-TFJobs | [Distributed training using TF Jobs](02-TFJobs/Readme.md) |
| 03-PyTorchJobs | [Distributed training using Pytorch Jobs](03-PyTorchJobs/Readme.md) |
| 04-KFServing | [Serving models with KFServing](04-KFServing/Readme.md) |
| 05-Pipelines | [Create an end to end pipeline that train with TF Jobs and deploy on cluster](05-Pipelines/Readme.md) |
| 06-Katib | [Hyperparameter tuning with Katib](06-Katib/Readme.md) |

## Links

- https://docs.microsoft.com/en-us/azure-stack - Azure Stack web page
- https://ubuntu.com/tutorials/ubuntu-on-windows - Ubuntu on Windows10
