# Stand Alone KFServing Setup On Kubernetes Clusters

In this article, you will set up stand alone KFServing on a kubernetes cluster. KFserving depends on a few
components. You will install:

*	Istio for service management
*	Knative
*	Cert-manager 
*	KFserving

## Prerequisites

*   Make sure you have access to a kubernetes cluster with version 1.5.x
*   Terminal access to the kubernetes master node

## Install Istio

### Istio 1.6.1 supports kubernetes 1.5.

*  download the package:


    ```cd ~```

    ```curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.6.1 sh -```


*  Check istio-1.6.1 is downloaded:

    ```ls```

    ```istio-1.6.1``` 

*  Update PATH:
   
    ```export PATH="$PATH:/home/azureuser/istio-1.6.1/bin"```
   
*  Run a Pre-check:
   
    ```istioctl x precheck```

*  Install:
   
    ```istioctl install --set profile=demo -y```

*  Verify:

    ```istioctl verify-install```

*  View deployed kubernetes resources:

    ```kubectl get all -n istio-system```

    More details is at [here](https://istio.io/latest/docs/setup/getting-started/)

## Install Knative

### Knative v0.14 supports kubernetes 1.15

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


## Install Cert Manager

*  Cert Manager v0.14.0 supports kubernetes 1.15

    ```kubectl apply --filename https://github.com/knative/serving/releases/download/v0.14.0/serving-default-domain.yaml```

## Install KFserving

   Details of installation guide for stand alone KFserving can be found [here](https://github.com/kubeflow/kfserving#standalone-kfserving-installation)

*  Install Kubernetes Resources: 

    ```kubectl apply -f "Yaml\kfserving_v1_4_1.yaml" --validate=false```

*   View the Resources:

     ```kubectl get issuer -n kfserving-system```

    ```kubectl get po -n kfserving-system```

##  Install Demo (optional)

    
