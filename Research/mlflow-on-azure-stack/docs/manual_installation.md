# MLflow on Azure Stack

This module demonstrates how to manually install an MLflow remote tracking server using Kubernetes on Azure Stack


## Prerequisites 
- Access to an existing Kubernetes cluster
- A kubeconfig file to connect to cluster
- A private ACR repository in Azure
- Anaconda
- Docker desktop
- Kubectl 

## Step 1: Build and Push Image
Run the below commands to build the Dockerfile in this directory and push it to a private container registry. Be sure to replace the following with the details of your Azure Container Registry (ACR) details: <your-registry-server> , <registry-username> , <registry-password>

```sh
docker login <your-registry-server> -u <registry-username> -p <registry-password>
docker build . -t mlflow-server:latest
docker tag mlflow-server:latest <your-registry-server>/mlflow-server:latest
docker push <your-registry-server>/mlflow-server:latest
```


## Step 2: Connect to Kubernetes Cluster
**TODO:** add more details to this step
Connect to your Kubernetes cluster using your kubeconfig file


## Step 3: Create a namespace
Run the below command to create a new namespace in your Kubernetes cluster. Be sure to replace <your-namespace> with a name of your choosing. Make a note of this name as it will be needed for subsequent steps.

```sh
kubectl create namespace <your-namespace>
```


## Step 4: Create secret to private container registry
Run the below command to create a new secret which contains the credentials for your private container registry. Be sure to replace <your-namespace> , <your-registry-server> , <your-name> , and <your-pword> in the command before running it

```sh
kubectl create secret docker-registry regcred --namespace <your-namespace> --docker-server=<your-registry-server> --docker-username=<your-name> --docker-password=<your-pword>
```


## Step 5: Edit Kubernetes manifest
Open tracking_server.yaml in this directory and edit the image to deploy. Replace <your-registry-server> with the url for your private Azure Container Registry. Be sure to save the updated file and proceed to the next step.

```yaml
image: <your-registry-server>/mlflow-server:latest
```


## Step 6: Deploy MLflow Tracking Server to Cluster
Run the below command to deploy the manifest to your Kubernetes namespace. It should take a couple of minutes for the Cluster to pull down the container and start up a pod. After a while, proceed to the next step to retrieve the service IP. 

```sh
kubectl apply -f ./tracking_server.yaml --namespace <your-namespace>
```


## Step 7: Get External IP for MLflow Tracking Server
Run the below command to retrieve the external IP for the mlflow-server instance you deployed in the previous step. Be sure to replace <your-namespace> with the one you created in the above steps.

```sh
kubectl get service mlflow-service --namespace <your-namespace> --output jsonpath={.status.loadBalancer.ingress[0].ip}
```

## Step 8: Access UI
1. Open your browser window
1. Enter the the IP from the previous step in the below format
1. http://<ip from above>:5000
1. You should see something like the image below

## Step 9: Starting the Jupyter Notebook Tutorial
Open Jupyter Notebook, it should have been installed along side Anaconda. Navigate to the "notebooks" directory and select the MLflow_Tutorial notebook.

Follow along in the tutorial. Any cell can be run by pushing shift + enter.
