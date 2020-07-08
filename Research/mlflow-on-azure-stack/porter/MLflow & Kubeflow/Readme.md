# MLflow and Kubeflow Installation On Kubernetes

This guide demonstrates how to install a remote MLflow Tracking Server & Kubeflow on Kubernetes. The instructions below demonstrate how to install using a Cloud Native Application Bundle (CNAB). Please see the document referenced below for manual installation instructions.

**Reference Material:**
- [Manual Installation Instructions for Mlflow](./docs/manual_installation.md)
- [Manual Installation Instructions for Kubeflow](/Research/kubeflow-on-azure-stack/Readme.md)

**Prerequisite:**
- Will need the k8 cluster ".kubeconfig" file on your local machine to execute commands on the k8 cluster 
- Below instructions are not intended to be run from the master node, but from another Linux dev environment
- Clone the github repo at "/home/user/" path

## Step 1: Install Porter
Make sure you have Porter installed. You can find the installation instructions for your OS at the link provided below.

[Porter Installation Instructions](https://porter.sh/install/)

**NOTE:** be sure to add porter to your PATH so it can find the binaries

## Step 2 : Install CNAB Packages
We have CNAB packages for Kubeflow & MLFlow, use any of the below link to install 

 - [Link to Kubeflow](https://github.com/NealAnalyticsLLC/azure-intelligent-edge-patterns/blob/mlflow-on-azure-stack/Research/mlflow-on-azure-stack/porter/kubeflow/Readme.md)
 - [Link to MLFlow](https://github.com/NealAnalyticsLLC/azure-intelligent-edge-patterns/blob/mlflow-on-azure-stack/Research/mlflow-on-azure-stack/porter/mlflow/Readme.md)
