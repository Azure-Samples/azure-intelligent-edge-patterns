# KFServing

## Overview

The idea behind model serving in general is to disconnect the model development
from model deployment and from usage (predictions, interpretations, etc.)
Naturally, every platform targets allowing multi-framework model serving.

Kubeflow supports two model serving systems, KFServing and Seldon Core.

See the [Kubeflow serving feature matrix](https://www.kubeflow.org/docs/components/serving/overview/) for more details.

## Installation

[KFServing](https://www.kubeflow.org/docs/components/serving/kfserving/) has beta status. You need to install this component separately:

    $ pip install kfserving

And you need the prerequisites:

- ISTIO_VERSION 1.6.2
- KNATIVE_VERSION v0.15.0
- KFSERVING_VERSION v0.4.0

Then run the install script from [kfserving repository](https://github.com/kubeflow/kfserving/blob/master/hack/quick_install.sh):

    $ ./hack/quick_install.sh

Check KFServing controller works(its pod is in `Running` state):

    $ kubectl get po -n kfserving-system
    NAME                             READY   STATUS    RESTARTS   AGE
    kfserving-controller-manager-0   2/2     Running   2          13m

## Infrerencing using KFServing

To create KFServing inference service, you can try a sample from [kfserving repository](https://github.com/kubeflow/kfserving):

    $ kubectl create namespace kfserving-test
    $ kubectl apply -f docs/samples/sklearn/sklearn.yaml -n kfserving-test

In this case you will see an `inferenceservices` object:

    $kubectl get inferenceservices sklearn-iris -n kfserving-test
    NAME           URL                                                              READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    sklearn-iris   http://sklearn-iris.kfserving-test.example.com/v1/models/sklearn-iris   True    100                                109s

You need to define your ingress host and port:

    $ kubectl get svc istio-ingressgateway -n istio-system
    NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)   AGE
    istio-ingressgateway   LoadBalancer   172.21.109.129   130.211.10.121   ...       17h
    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

Now you can do the inference by webservices from ingress gateway with an Iris dataset
sample(for example, available from [kfserving repository](https://github.com/kubeflow/kfserving) ):

    $ SERVICE_HOSTNAME=$(kubectl get inferenceservice sklearn-iris -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)
    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/sklearn-iris:predict -d @./docs/samples/sklearn/iris-input.json


You can also batch jobs and run, for example, a performance test from [kfserving repository](https://github.com/kubeflow/kfserving):

    kubectl create -f docs/samples/sklearn/perf.yaml -n kfserving-test
    # wait the job to be done and check the log
    kubectl logs load-test8b58n-rgfxr -n kfserving-test
    Requests      [total, rate, throughput]         30000, 500.02, 499.99
    Duration      [total, attack, wait]             1m0s, 59.998s, 3.336ms
    Latencies     [min, mean, 50, 90, 95, 99, max]  1.743ms, 2.748ms, 2.494ms, 3.363ms, 4.091ms, 7.749ms, 46.354ms
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

---

[Back to 03-PyTorchJobs](../03-PyTorchJobs/Readme.md) | [Back to main page](../Readme.md) | [Next to 05-Pipelines](../05-Pipelines/Readme.md)
