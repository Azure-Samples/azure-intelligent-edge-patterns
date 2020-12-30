1. Install [Helm](https://helm.sh/docs/intro/install/) on your local machine
1. Connect to your Kubernetes cluster 


1. Install required Helm charts from a public repo
```cli
export SET HELM_EXPERIMENTAL_OCI=1
helm chart remove amlk8s.azurecr.io/public/azureml/amlk8s/helmchart/eastus/preview/amlk8s-extension:1.0.0
helm chart pull amlk8s.azurecr.io/public/azureml/amlk8s/helmchart/eastus/preview/amlk8s-extension:1.0.0
helm chart export amlk8s.azurecr.io/public/azureml/amlk8s/helmchart/eastus/preview/amlk8s-extension:1.0.0 --destination ./install
cd install
```

4. View chart details
```
helm show chart amlk8s-extension
~/Downloads/install $ helm show chart amlk8s-extension
apiVersion: v2
appVersion: 1.16.0
description: Azure Machine Learning Arc Extension for K8s
name: amlk8s-extension
type: application
version: 1.0.0
```

5. Create azureml namespace

`kubectl create ns azureml`

6. Install amlk8s agent/operator
```
helm install aml-compute ./amlk8s-extension -n azureml --set  RelayConnectionString="Endpoint=sb://adramak8sworkspace963585242.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=U7S2h3/WSv2HRj/LHyMlnaaLs2D0xPheSWiaIJMmUR4=;EntityPath=connection_0"
```

Verify all components are installed 

```
sauryadas@Sauryas-MacBook-Pro  ~/Downloads/install  kubectl get po -n azureml
NAME                                       READY   STATUS      RESTARTS   AGE
aml-compute-admission-64999c958f-2hlr9     1/1     Running     0          33s
aml-compute-admission-init-8282m           0/1     Completed   0          33s
aml-compute-controllers-7b88b87b4b-tnrbn   1/1     Running     0          33s
aml-compute-scheduler-c865cbd98-tmdgh      1/1     Running     0          33s
aml-mpi-operator-5b8dd6db6d-s7ldg          1/1     Running     0          33s
aml-operator-66d589bf5d-nv7k9              1/1     Running     0          33s
aml-pytorch-operator-5757f99b99-wcm4h      1/1     Running     0          33s
aml-tf-job-operator-57c4c6f9bf-mbtt4       1/1     Running     0          33s
compute-exporter-7894fd4b6-8w4k9           1/1     Running     0          33s
job-exporter-2crgt                         1/1     Running     0          33s
job-exporter-5f7zh                         1/1     Running     0          33s
job-exporter-vfssh                         1/1     Running     0          33s
metric-reporter-f89cc986-qj2zt             1/1     Running     0          33s
prometheus-deployment-5b6f77f688-s5zx8     1/1     Running     0          32s
relay-server-676fb74d66-7qdvv              1/1     Running     0          32s
rest-server-647bf78bcf-7tx8w               1/1     Running     0          33s
```

7. Uninstall installed amlk8s agent
```
helm uninstall azureml-connector -n azureml
```
