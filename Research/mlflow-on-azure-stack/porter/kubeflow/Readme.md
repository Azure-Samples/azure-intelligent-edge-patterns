# Kubeflow Installation On Kubernetes using CNAB

This guide demonstrates how to install a Kubeflow on Kubernetes. The instructions below demonstrate how to install using a Cloud Native Application Bundle (CNAB). Please see the document referenced below for manual installation instructions.

**Reference Material:**
- [Manual Installation Instructions](/Research/kubeflow-on-azure-stack/Readme.md)

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

    $ cd Research/mlflow-on-azure-stack/porter/kubeflow

Change the file permissions if needed:

    $ chmod 777 kubeflow.sh

Next, you will build the porter CNAB

    $ porter build

## Step 3: Generate Credentials 

This step is needed to connect to your Kubernetes cluster

    $ porter credentials generate 

You will have options to generate the credentials. We recommend you export the kubeconfig from your cluster,
it is usually `~/.kube/config` or `/etc/kubernetes/admin.conf` on the Master node of your cluster. And then
enter path to your kubeconfig file when prompted.

Validate that your credential is present by running the below command. You should see something like the below output.

    $ porter credentials list

![List Porter Credentials](/Research/mlflow-on-azure-stack/docs/img/porter-credentials-validate.png)


## Step 4: Use Porter CNAB
Run one of the below commands to interact with the CNAB

To Install :

    $ porter install --cred KubeflowInstaller

And later, if you need, you can upgrade:

    $ porter upgrade --cred KubeflowInstaller

When you do not want it anymore, you can uninstall the package:

    $ porter uninstall --cred KubeflowInstaller

### Step 5: Check for pods and services

After the installation each of the services gets installed into its own namespace, try below commands to look for pods and services:

    $ kubectl get pods -n kubeflow
    $ kubectl get svc -n kubeflow

### Step 6: Opening Kubeflow dashboard
To access the dashboard using external connection, replace "type: NodePort" with "type: LoadBalancer" using the patch command:

    $ kubectl patch svc/istio-ingressgateway -p '{"spec":{"type": "LoadBalancer"}}' -n istio-system
    service/istio-ingressgateway patched

Then the EXTERNAL-IP will become available from:

    $ kubectl get -w -n istio-system svc/istio-ingressgateway
    NAME                   TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)                          AGE
    istio-ingressgateway   LoadBalancer   10.0.123.210   12.34.56.78   15020:30397/TCP,80:31380/TCP,..  7m27s

![Kubeflow dashboard](/Research/mlflow-on-azure-stack/docs/img/kubeflow_dashboard1.png) 

Use external-ip to open it in your browser, and make sure your firewall rules allow HTTP port 80.

You can monitor Kubeflow cluster by looking at the Kubernetes status, you might need to wait to let the pods create containers and start.

For more information see [Installing Kubeflow on Azure](https://www.kubeflow.org/docs/azure/deploy/install-kubeflow/) 

### Step 7: Creating a Notebook Server
Note: you should have MLFlow installed for this step, which can be found here [Installing MLFlow](/Research/mlflow-on-azure-stack/porter/mlflow/Readme.md)

From the Kubeflow dashboard select "Notebook Servers". Pick the namespace you want to create the server under and select "+ New Server".

Enter the desired specs for your server. Make sure the "Custom Image" checkbox is select and input `naedwebs/jupyter-mlflow` in the text field for this option. Click "Launch".
### Step 8: Upload a Notebook

Once your server is running click "Connect". A Jupyter Notebook landing page should load on a new tab. On the right hand side of this page push the "Upload" button and select the MLflow_Tutorial notebook found in the notebooks folder in this repository and hit open. Click the blue "Upload" button that has just appeard. Select the notebook to run it.
