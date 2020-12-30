# Azure ML Examples

This folder shows Azure ML examples using mlflow framework on cmaks compute.

## Getting started

### install a few required packages

```sh
pip install -r requirements.txt
```

### install cmaks sdk

```sh
pip install --disable-pip-version-check --extra-index-url https://azuremlsdktestpypi.azureedge.net/CmAks-Compute-Test/D58E86006C65 azureml-pipeline-steps azureml-contrib-pipeline-steps azureml-contrib-k8s --upgrade
```

## Notebooks

path|scenario|compute|framework(s)|dataset|environment type|distribution|other
-|-|-|-|-|-|-|-
[fastai/train-mnist-resnet18.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/fastai/mnist-resnet18/train-mnist-resnet18.ipynb)|training|CMAKS - CPU|fastai, mlflow|mnist|conda file|None|None
[fastai/train-pets-resnet34.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/fastai/pets-resnet34/train-pets-resnet34.ipynb)|training|CMAKS - GPU|fastai, mlflow|pets|docker file|None|broken :(
[lightgbm/train-iris.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/lightgbm/iris/train-iris.ipynb)|training|CMAKS - CPU|lightgbm, mlflow|iris|pip file|None|None
[pytorch/train-mnist-cnn.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/pytorch/mnist-cnn/train-mnist-cnn.ipynb)|training|CMAKS - GPU|pytorch|mnist|curated|None|None
[sklearn/train-diabetes-ridge.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/sklearn/diabetes-ridge/train-diabetes-ridge.ipynb)|training|CMAKS - CPU|sklearn, mlflow|diabetes|conda file|None|None
[tensorflow-v2/train-iris-nn.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/tensorflow-v2/iris-nn/train-iris-nn.ipynb)|training|CMAKS - CPU|tensorflow2, mlflow|iris|conda file|None|None
[tensorflow-v2/train-mnist-nn.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/tensorflow-v2/mnist-nn/train-mnist-nn.ipynb)|training|CMAKS - GPU|tensorflow2, mlflow|mnist|curated|None|None
[xgboost/train-iris.ipynb](https://github.com/Azure/AML-Kubernetes/tree/master/sample_notebooks/009%20MLFlow/xgboost/iris/train-iris.ipynb)|training|CMAKS - CPU|xgboost, mlflow|iris|pip file|None|None
