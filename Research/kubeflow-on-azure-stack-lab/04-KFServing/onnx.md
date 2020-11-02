# KFServing of custom ONNX models

## Deploying model

Deployed model is a CRD `inferenceservice`. You can crete it in the same namespace we created earlier in this lab like so:

    $ kubectl create -f onnx.yaml -n kfserving-test
    inferenceservice.serving.kubeflow.org/style-sample created

In a few minutes you should see the pods running:

    $ kubectl get pods -n kfserving-test
    NAME                                                              READY   STATUS    RESTARTS   AGE
    style-sample-predictor-default-5jk48-deployment-b7c89954c-6s6wn   3/3     Running   0          36s

And, more importantly, the `inferenceservice` in the `READY` state:

    $ kubectl get inferenceservice -n kfserving-test
    NAME           URL                                                                     READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    style-sample   http://style-sample.kfserving-test.example.com/v1/models/style-sample   True    


You can now [determine your ingress IP and port](https://github.com/kubeflow/kfserving/blob/master/README.md#determine-the-ingress-ip-and-ports):

For KFServing deployment within Kubeflow:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

For other stand-alone KFServing deployments:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

Before you run inference on your model, it is useful to define environment variables:

    $ export MODEL_NAME=style-sample
    $ export SERVICE_HOSTNAME=$(kubectl get inferenceservice ${MODEL_NAME} -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

## Inference with the deployed model

From the Kubeflow dashboard of the Azure Stack environment, create Jupyter Server, and open the notebook [onnx-mosaic.ipynb](onnx-mosaic.ipynb).
Provide the  INGRESS_PORT, INGRESS_HOST, and SERVICE_HOSTNAME to do the inferencing.

For troubleshooting, see the latest versions at [Kubeflow KFServing ONNX](https://github.com/kubeflow/kfserving/tree/master/docs/samples/onnx)

## Links

- https://www.tensorflow.org/guide/saved_model
- https://github.com/kubeflow/kfserving/tree/master/docs/samples/onnx

---

[Back](Readme.md)
