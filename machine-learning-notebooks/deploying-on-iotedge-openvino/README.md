# ONNX and OpenVINO model deployment with Azure ML service to Azure stack edge using Iot edge

You can use Azure Machine Learning to package, debug, validate and deploy inference containers.
For more information please check out this article: https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-machine-learning-edge-04-train-model

## Prerequisites

To begin, you will need an ML workspace.

For more information please check out this article: https://docs.microsoft.com/en-us/azure/machine-learning/service/how-to-manage-workspace

You also need to get you Azure Stack Edge setup and run a sample a gpu sample as : https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-sample-module-marketplace

## Deploy to the Azure stack edge

You can deploy to the Azure stack edge as 
- [Notebook model register and deploy](deploy-with-openvino.ipynb).
- [ONNX Runtime with OpenVINO using Azure ML](https://github.com/Azure-Samples/onnxruntime-iot-edge/tree/master/AzureML-OpenVINO).

Follow the instructions and run our notebook that registers a model and deploys it:

[deploy-with-openvino.ipynb](deploy-with-openvino.ipynb)

# Links

- https://azure.microsoft.com/en-us/free/
- https://docs.microsoft.com/en-us/azure/machine-learning/how-to-configure-environment#jupyter
