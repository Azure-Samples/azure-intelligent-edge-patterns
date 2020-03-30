---
page_type: sample
languages:
- python
- csharp
products:
- azure
description: "These samples assume you are familiar with the Azure ML Hardware Accelerated Models (HAM) product."
urlFragment: aml-hardware-accelerated-models
---

# Azure Machine Learning Hardware Accelerated Models - Samples

## Getting Started
These samples assume you are familiar with the Azure ML Hardware Accelerated Models (HAM) product. If not, you can read more [here](https://docs.microsoft.com/en-us/azure/machine-learning/service/concept-accelerate-with-fpgas). The samples in this repo are: 
 
* [Deploy to Data Box Edge](deploy-to-databox-edge)
    * Follow these sample notebooks if you have a Databox Edge machine. Data Box Edge is an on-premise server that is enabled with an FPGA. Read more [here](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-overview).

### Quickstart
```
git clone https://github.com/Azure-Samples/aml-hardware-accelerated-models.git
cd aml-hardware-accelerated-models
pip install azureml-accel-models[cpu]
pip install jupyter
jupyter notebook
```
