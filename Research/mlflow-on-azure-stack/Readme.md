# MLflow Installation On Kubernetes

This guide demonstrates how to install a remote MLflow Tracking Server on Kubernetes. The instructions below demonstrate how to install using a Cloud Native Application Bundle (CNAB). Please see the document referenced below for manual installation instructions.

**Reference Material:**
- [Manual Installation Instructions](./docs/manual_installation.md)


## Step 1: Install Porter
Make sure you have Porter installed. You can find the installation instructions for your OS at the link provided below.

[Porter Installation Instructions](https://porter.sh/install/)


## Step 2: Build Porter CNAB
First you will need to navigate to this directory in the repository
Next, you will build the porter CNAB

```sh
porter build
```

## Step 3: Generate Credentials 
This step is needed to connect to your Kubernetes cluster

```sh
porter credentials generate 
```
Enter path to your kubeconfig file when prompted

## Step 4: Use Porter CNAB
Run one of the below commands to interact with the CNAB

```sh
porter install --cred <name of your credential>
porter upgrade --cred <name of your credential>
porter uninstall --cred <name of your credential>
```