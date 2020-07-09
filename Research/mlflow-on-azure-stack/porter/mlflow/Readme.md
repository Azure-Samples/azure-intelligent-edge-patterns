# MLflow Installation On Kubernetes using CNAB

This guide demonstrates how to install a remote MLflow Tracking Server on Kubernetes. The instructions below demonstrate how to install using a Cloud Native Application Bundle (CNAB). Please see the document referenced below for manual installation instructions.

**Reference Material:**
- [Manual Installation Instructions](/Research/mlflow-on-azure-stack/docs/manual_installation.md)

**Prerequisite:**
- Will need the k8 cluster ".kubeconfig" file on your local machine to execute commands on the k8 cluster 
- Below instructions are not intended to be run from the master node, but from another Linux dev environment
- Clone the github repo at "/home/user/" path

## Step 1: Install Porter
Make sure you have Porter installed. You can find the installation instructions for your OS at the link provided below.

[Porter Installation Instructions](https://porter.sh/install/)

**NOTE:** be sure to add porter to your PATH so it can find the binaries


## Step 2: Build Porter CNAB
First you will need to navigate to porter directory in the repository. For example 

```sh
cd ./research/mlflow-on-azure-stack/porter/mlflow
```
Change the file permissions

```sh
chmod 777 mlflow.sh
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

![List Porter Credentials](/Research/mlflow-on-azure-stack/docs/img/porter-credentials-validate.png)


## Step 4: Use Porter CNAB
Run one of the below commands to interact with the CNAB


To Install :
```sh
porter install --cred MLFlowInstaller
```
To Upgrade :
```sh
porter upgrade --cred MLFlowInstaller
```
To Uninstall :
```sh
porter uninstall --cred MLFlowInstaller
```
### Step 5: Check for pods and services
After the installation each of the services gets installed into its own namespace, try below commands to look for pods and services:

```sh
kubectl get pods -n mlflow
kubectl get svc -n mlflow
``` 

### Step 6: Opening MLflow dashboard
To access the dashboard using external connection, first we need to get the external-ip:

```sh
$ kubectl get svc -n mlflow
NAME             TYPE           CLUSTER-IP    EXTERNAL-IP     PORT(S)          AGE
mlflow-service   LoadBalancer   10.0.176.78   52.250.47.209   5000:31148/TCP   19m
```
Use external-ip to open it in your browser, and make sure your firewall rules allow HTTP port 5000.

![MLflow dashboard](/Research/mlflow-on-azure-stack/docs/img/mlflow_dashboard.png)

