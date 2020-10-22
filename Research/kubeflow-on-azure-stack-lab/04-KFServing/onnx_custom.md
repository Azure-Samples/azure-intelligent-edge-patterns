# KFServing of custom ONNX models

For example, see how you could [Register and Deploy ONNX Model]( 
https://github.com/Azure/MachineLearningNotebooks/blob/2aa7c53b0ce84e67565d77e484987714fdaed36e/how-to-use-azureml/deployment/onnx/onnx-model-register-and-deploy.ipynb)

We will be using `onnx-mnist-model.onnx` from that example. You would need to move it to the `pvc` in your cluster as we did in other labs, or
upload it to your `gs://` or `s3://` storage.

## Deploying model

Deployed model is a CRD `inferenceservice`. You can crete it in the same namespace we created earlier in this lab like so:

    $ kubectl create -f onnx_custom.yaml -n kfserving-test
    inferenceservice.serving.kubeflow.org/mnist-onnx created

In a few minutes you should see the pods running:

    $ kubectl get pods -n kfserving-test
    NAME                                                              READY   STATUS    RESTARTS   AGE
    mnist-onnx-predictor-default-5jk48-deployment-b7c89954c-6s6wn   3/3     Running   0          36s

And, more importantly, the `inferenceservice` in the `READY` state:

    $ kubectl get inferenceservice -n kfserving-test
    NAME           URL                                                                     READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    mnist-onnx   http://mnist-onnx.kfserving-test.example.com/v1/models/mnist-onnx         True    


You can now [determine your ingress IP and port](https://github.com/kubeflow/kfserving/blob/master/README.md#determine-the-ingress-ip-and-ports):

For KFServing deployment within Kubeflow:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

For other stand-alone KFServing deployments:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

Before you run inference on your model, it is useful to define environment variables:

    $ export MODEL_NAME=mnist-onnx
    $ export SERVICE_HOSTNAME=$(kubectl get inferenceservice ${MODEL_NAME} -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

## Inference with the deployed model

You need to convert your input into a JSON format, as example, we provide `onnx-mnist-input.json` to show the tags.

    $ export INPUT_PATH=onnx-mnist-input.json
    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict -d $INPUT_PATH

In some cases, depending on the model, you would need to do the post-processing of the output.

## Links

- https://www.tensorflow.org/guide/saved_model
- https://github.com/kubeflow/kfserving/tree/master/docs/samples/onnx

---

[Back](Readme.md)
