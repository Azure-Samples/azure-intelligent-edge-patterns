# Stand Alone KFServing Setup On Kubernetes Clusters

In this article, you will set up stand alone KFServing on a kubernetes cluster. KFserving depends on a few
components. You will install:

*	Istio for service management
*	Knative
*	Cert-manager 
*	KFserving

## Prerequisites

*   Make sure you have access to a kubernetes cluster with version 1.5.0 or above
*   Terminal access to the kubernetes master node

## Install [Istio](https://istio.io/latest/docs/)

Before you can install Istio, you need a cluster running a compatible version of Kubernetes. For Istio and Kubernetes version compatibility, 
please see [Support status of Istio releases](https://istio.io/latest/about/supported-releases/#support-status-of-istio-releases)

Then you can following the [Istio installation guide](https://istio.io/latest/docs/setup/getting-started/)


## Install [Knative](https://knative.dev/docs/)

NOTE: In the following Knative intallation guide, please skip installation of Istio if you have already installed Istio as described above.

For Kubenetes 1.16.x, please see [Knative 0.17 installation guide](https://github.com/knative/docs/blob/release-0.17/docs/install/any-kubernetes-cluster.md)

For Kubenetes 1.15.x, please see [Knative 0.14 installation guide](https://github.com/knative/docs/blob/release-0.14/docs/install/any-kubernetes-cluster.md)

For Kubenetes 1.17 and above, please see [Knative installation guid](https://knative.dev/v0.18-docs/install/any-kubernetes-cluster/)

### Here we take install Knative v0.4 (for kubernetes 1.15) as an example:

*  Install Custom Resource Definitions:
   
    ```kubectl apply --filename https://github.com/knative/serving/releases/download/v0.14.0/serving-crds.yaml```

*  Install Core Resources:

    ```kubectl apply --filename https://github.com/knative/serving/releases/download/v0.14.0/serving-core.yaml ```

*  Create Namespace "knative-serving"
   
    ```kubectl create namespace knative-serving```
   
*  Install Knative Istio controller:

    ```kubectl apply --filename https://github.com/knative/net-istio/releases/download/v0.14.0/release.yaml```

*  Configure DNS:
   
   Details of configuring DNS are covered [here](https://knative.dev/v0.18-docs/install/any-kubernetes-cluster/). For
   testing purpose, We create a simple Kubernetes Job called “default domain” that will configure Knative Serving 
   to use xip.io as the default DNS suffix
   
 ```kubectl apply --filename "Yaml\serving-default-domain-knative-1-4-0.yaml" ```
   
*  View pods created:

    ```kubectl get pods --namespace knative-serving```

## Install [Cert-Manager](https://cert-manager.io/docs/)

Install cert-manager, please see [installation guide](https://cert-manager.io/docs/installation/kubernetes/)

## Install [KFserving](https://www.kubeflow.org/docs/components/serving/kfserving/)


*  Install Kubernetes Resources: 

   For your convenience, we have included the yaml file.

    For Kubernetes 16.0 or above:
   ```kubectl apply -f "Yaml\kfserving_v1_4_1.yaml" ```
   
    For Kubernetes 1.15
    ```kubectl apply -f "Yaml\kfserving_v1_4_1.yaml" --validate=false```

*   View the Resources:

     ```kubectl get issuer -n kfserving-system```

    ```kubectl get po -n kfserving-system```

More details can be found [here](https://github.com/kubeflow/kfserving#standalone-kfserving-installation)

## Next Steps

Learn how to [inference using KFServing with model in Azure Storage Blobs](KFServing-with-model-in-Azure-Storage.md)

    
