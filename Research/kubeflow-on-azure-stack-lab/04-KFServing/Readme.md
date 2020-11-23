# KFServing

## Overview

The idea behind model serving in general is to disconnect the model development
from model deployment and from usage (predictions, interpretations, etc.)
Naturally, every platform targets allowing multi-framework model serving.

Kubeflow supports two model serving systems, KFServing and Seldon Core.

See the [Kubeflow serving feature matrix](https://www.kubeflow.org/docs/components/serving/overview/) for more details.

## Installation

In more generic case, please see [KFServing](https://www.kubeflow.org/docs/components/serving/kfserving/).

In this demo we will use a Minikube cluster for our KFServing deployment.

    $ curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
        % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
        100 55.9M  100 55.9M    0     0  76.1M      0 --:--:-- --:--:-- --:--:-- 76.1M

    $ sudo mkdir -p /usr/local/bin/
    $ sudo install minikube /usr/local/bin/

Check that you have docker on your machine:

    $ docker run hello-world
    ...
    Hello from Docker!
    ...

We will run Minikube like so:

    $ minikube start --cpus 4 --memory 8192 --driver=docker --kubernetes-version=v1.17.11

Then run the install script from [kfserving repository](https://github.com/kubeflow/kfserving/blob/master/hack/quick_install.sh):

    $ ./hack/quick_install.sh

Check KFServing controller works(its pod is in `Running` state):

    $ kubectl get pods -n kfserving-system
    NAME                             READY   STATUS    RESTARTS   AGE
    kfserving-controller-manager-0   2/2     Running   2          13m

## KFServing Installation with Kubeflow on Azure Stack

KFServing is installed by default as part of Kubeflow installation. If you did what is described in [00-Intro](../00-Intro/Readme.md), you should see the CRD defined in your system: 

    $ kubectl get crd | grep inference
    inferenceservices.serving.kubeflow.org                      2020-10-02T19:22:32Z

And you should see the KFServing controller manager in `kubeflow` namespace:

    $ kubectl get pods -A
    NAMESPACE         NAME                                                              READY   STATUS      RESTARTS   AGE
    ...
    kubeflow          kfserving-controller-manager-0                                    2/2     Running     0          137m
    ...

You would need to manually label your particular namespace with `inferenceservice=enabled`, for example:

    $ kubectl create namespace kfserving-test
    $ kubectl label namespace kfserving-test serving.kubeflow.org/inferenceservice=enabled
    namespace/kfserving-test labeled

You might also need to resolve the access issues, see [Kubernetes documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) or [KFServing Troubleshooting](https://github.com/kubeflow/kfserving/blob/master/docs/DEVELOPER_GUIDE.md#troubleshooting).

---

## Infrerencing using KFServing

You are free to deploy your own, custom-made `inferenceservice` if you want.

For that, please see a separate sub-page, [KFServing custom-made inferenceservice](custom/Readme.md)

It is more common to use models from popular frameworks, for example, [TensorFlow](tensorflow.md),
[PyTorch](pytorch.md), [ONNX](onnx.md), Triton, XGBoost, or SKLearn. We describe them below.

---

### KFServing TensorFlow models

Please see a separate sub-page, [KFServing TensorFlow models](tensorflow.md)

---

### KFServing PyTorch models

You can validate PyTorch models using PyTorch cli before deploying.

Please see a separate sub-page, [KFServing PyTorch models](pytorch.md)
 
---

### KFServing models saved in ONNX format

ONNX is an ecosystem that could contain models from different frameworks and custom
action blocks.

Please see a separate sub-page, [KFServing models saved in ONNX format](onnx.md)

---

### KFServing using Triton

Triton is a high-performance inferencing server from NVIDIA

Please see a separate sub-page, [KFServing using Triton](triton/Readme.md)

---

### KFServing model SKLearn Iris model

Let us walk through a demo for SKLearn, which is similar for other ML frameworks.

To create KFServing inference service, you can try a sample from [kfserving repository](https://github.com/kubeflow/kfserving):

    $ kubectl create namespace kfserving-test
    $ kubectl apply -f sklearn_iris.yaml -n kfserving-test

You should see the pods come up(it may take a few minutes, depending on which container images you already have in your environment):

    $ kubectl get po -n kfserving-test
    NAME                                                              READY   STATUS    RESTARTS   AGE
    sklearn-iris-predictor-default-wgn72-deployment-7f848bc9ff5bzd9   2/2     Running   0          11m

And you will see an `inferenceservices` object(it should be in Ready state and have a URL):

    $ kubectl get inferenceservices sklearn-iris -n kfserving-test
    NAME           URL                                              READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    sklearn-iris   http://sklearn-iris.kfserving-test.example.com   True    100                                11m

You need to define your ingress host and port. Depending on your configuration, you may not have EXTERNAL-IP:

    $ kubectl get svc istio-ingressgateway -n istio-system
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)   AGE
    istio-ingressgateway   LoadBalancer   172.21.109.129   130.211.10.121   ...       17h

For Minikube, for example, you can get INGRESS_HOST by running:

    $ export INGRESS_HOST=$(minikube ip)
    
In other cases(see [kfserving documentation](https://github.com/kubeflow/kfserving) ):

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

Check that they are not empty:

    $ echo $INGRESS_HOST
    172.17.0.3
    $ echo $INGRESS_PORT
    32162

And also define SERVICE_HOSTNAME:

    $ export SERVICE_HOSTNAME=$(kubectl get inferenceservice sklearn-iris -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

Now you can do the inference by webservices from ingress gateway. Prepare the .json with the input data:

    $ cat sklearn_iris_input.json
    {"instances": [[6.8,  2.8,  4.8,  1.4],
                [0.8,  2.8,  0.8,  1.4],
                [6.8,  0.8,  0.8,  1.4],
                [0.0,  0.4,  4.5,  9.6]]}

Run a web request to your service:

    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/sklearn-iris:predict -d @./sklearn_iris_input.json
    *   Trying 172.17.0.3...
    * TCP_NODELAY set
    * Connected to 172.17.0.3 (172.17.0.3) port 32162 (#0)
    > POST /v1/models/sklearn-iris:predict HTTP/1.1
    > Host: sklearn-iris.kfserving-test.example.com
    > User-Agent: curl/7.58.0
    > Accept: */*
    > Content-Length: 153
    > Content-Type: application/x-www-form-urlencoded
    >
    * upload completely sent off: 153 out of 153 bytes
    < HTTP/1.1 200 OK
    < content-length: 29
    < content-type: application/json; charset=UTF-8
    < date: Fri, 02 Oct 2020 00:42:50 GMT
    < server: istio-envoy
    < x-envoy-upstream-service-time: 8
    <
    * Connection #0 to host 172.17.0.3 left intact
    {"predictions": [1, 0, 0, 2]}

So, for your four subject points, you have the classification `[1, 0, 0, 2]`. You can convert it to the domain-specific tags.

## Performance testing of infrerencing using KFServing

You can also batch jobs and run, for example, a performance test from [kfserving repository](https://github.com/kubeflow/kfserving):

    $ kubectl create -f sklearn_iris_perf.yaml -n kfserving-test
    job.batch/load-test5cvmc created
    configmap/vegeta-cfg created

    $ kubectl get pods -n kfserving-test
    NAME                                                              READY   STATUS    RESTARTS   AGE
    load-test5cvmc-mxcgc                                              1/1     Running   0          30s
    sklearn-iris-predictor-default-wgn72-deployment-7f848bc9ff5bzd9   2/2     Running   0          31m

The `load-test...` pod will eventually turn into `Completed` state (keep re-running this command until it does):

    $ kubectl get po -n kfserving-test
    NAME                                                              READY   STATUS      RESTARTS   AGE
    load-test5cvmc-mxcgc                                              0/1     Completed   0          76s
    sklearn-iris-predictor-default-wgn72-deployment-7f848bc9ff5bzd9   2/2     Running     0          32m

You can get the summary of the test run from the pod's log:

    $ kubectl logs -n kfserving-test load-test5cvmc-mxcgc
    Requests      [total, rate, throughput]         30000, 500.01, 499.98
    Duration      [total, attack, wait]             1m0s, 59.998s, 3.547ms
    Latencies     [min, mean, 50, 90, 95, 99, max]  1.709ms, 2.152ms, 1.977ms, 2.443ms, 2.778ms, 5.427ms, 44.316ms
    Bytes In      [total, mean]                     690000, 23.00
    Bytes Out     [total, mean]                     2460000, 82.00
    Success       [ratio]                           100.00%
    Status Codes  [code:count]                      200:30000
    Error Set:

## Troubleshooting and next steps

See https://github.com/kubeflow/kfserving for more details.

# Links

- [https://www.kubeflow.org/docs/components/serving/kfserving/](https://www.kubeflow.org/docs/components/serving/kfserving/)
- [Kafka Event Source](https://github.com/knative/eventing-contrib/tree/master/kafka/source)
- [knative client](https://github.com/knative/client)
- https://developer.nvidia.com/nvidia-triton-inference-server

---

[Back to 03-PyTorchJobs](../03-PyTorchJobs/Readme.md) | [Back to main page](../Readme.md) | [Next to 05-Pipelines](../05-Pipelines/Readme.md)
