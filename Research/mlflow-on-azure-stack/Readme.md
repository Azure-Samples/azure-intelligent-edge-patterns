# MLflow and Kubeflow Installation On Kubernetes

This guide demonstrates how to install a remote MLflow Tracking Server on Kubernetes. The instructions below demonstrate how to install using a Cloud Native Application Bundle (CNAB). Please see the document referenced below for manual installation instructions.

**Reference Material:**
- [Manual Installation Instructions](./docs/manual_installation.md)


## Step 1: Install Porter
Make sure you have Porter installed. You can find the installation instructions for your OS at the link provided below.

[Porter Installation Instructions](https://porter.sh/install/)

**NOTE:** be sure to add porter to your PATH so it can find the binaries


## Step 2: Build Porter CNAB
First you will need to navigate to porter directory in the repository. For example 

```sh
cd ./research/mlflow-on-azure-stack/porter
```

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

Validate that your credential is present by running the below command. You should see something like the below output.
```sh
porter credentials list
```

![List Porter Credentials](./docs/img/porter-credentials-validate.png)


## Step 4: Use Porter CNAB
Run one of the below commands to interact with the CNAB

```sh
porter install --cred MLServicesInstaller
porter upgrade --cred MLServicesInstaller
porter uninstall --cred MLServicesInstaller
```
