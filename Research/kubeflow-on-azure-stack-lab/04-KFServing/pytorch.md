# KFServing PyTorch models

## Building a model and running inference on it.

You can run inferencing using pytorchserver, a part of Kubeflow KFServing GitHub reposotory.
See [KFServing PyTorch demo](https://github.com/kubeflow/kfserving/tree/master/docs/samples/pytorch) for more information if needed.

You need to have the `pytorchserver` installed. You may need to install the prerequisites manually, specifying
versions and hardware nuances(CUDA version, etc.)

In simple case:

    $ pip install torch torchvision

Clone KFServing repository and install the pre-requisites. See KFServing's
[python/pytorchserver](https://github.com/kubeflow/kfserving/tree/master/python/pytorchserver)
if you have any issues.

    $ git clone https://github.com/kubeflow/kfserving.git
    $ cd kfserving/python/pytorchserver
    $ pip install -e .

Verify that it works:

    /kfserving/python/pytorchserver$ python3 -m pytorchserver -h
    usage: __main__.py [-h] [--http_port HTTP_PORT] [--grpc_port GRPC_PORT]
                    [--max_buffer_size MAX_BUFFER_SIZE] [--workers WORKERS]
                    --model_dir MODEL_DIR [--model_name MODEL_NAME]
                    [--model_class_name MODEL_CLASS_NAME]

    optional arguments:
    -h, --help            show this help message and exit
    --http_port HTTP_PORT
                            The HTTP Port listened to by the model server.
    --grpc_port GRPC_PORT
                            The GRPC Port listened to by the model server.
    --max_buffer_size MAX_BUFFER_SIZE
                            The max buffer size for tornado.
    --workers WORKERS     The number of works to fork
    --model_dir MODEL_DIR
                            A URI pointer to the model directory
    --model_name MODEL_NAME
                            The name that the model is served under.
    --model_class_name MODEL_CLASS_NAME
                            The class name for the model.


You can create a model:

    $ python3 pytorch_cifar10.py
    Downloading https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz to ./data/cifar-10-python.tar.gz
    100.0%Extracting ./data/cifar-10-python.tar.gz to ./data
    Files already downloaded and verified
    [1,  2000] loss: 2.170
    [1,  4000] loss: 1.893
    [1,  6000] loss: 1.695
    [1,  8000] loss: 1.594
    [1, 10000] loss: 1.532
    [1, 12000] loss: 1.456
    [2,  2000] loss: 1.397
    [2,  4000] loss: 1.393
    [2,  6000] loss: 1.367
    [2,  8000] loss: 1.342
    [2, 10000] loss: 1.320
    [2, 12000] loss: 1.322
    Finished Training


And run the pytorchserver:

    $ python3 -m pytorchserver --model_dir `pwd` --model_name pytorchmodel --model_class_name Net
    [I 201008 17:15:32 storage:35] Copying contents of /home/azureuser/kfserving/docs/samples/pytorch to local
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/model.pt to pytorchmodel/model.pt
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/pytorch.yaml to pytorchmodel/pytorch.yaml
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/pytorchmodel to pytorchmodel/pytorchmodel
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/README.md to pytorchmodel/README.md
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/data to pytorchmodel/data
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/input.json to pytorchmodel/input.json
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/pytorch_gpu.yaml to pytorchmodel/pytorch_gpu.yaml
    [I 201008 17:15:32 storage:205] Linking: /home/azureuser/kfserving/docs/samples/pytorch/cifar10.py to pytorchmodel/cifar10.py
    [I 201008 17:15:34 kfserver:88] Registering model: pytorchmodel
    [I 201008 17:15:34 kfserver:77] Listening on port 8080
    [I 201008 17:15:34 kfserver:79] Will fork 0 workers
    [I 201008 17:15:34 process:126] Starting 6 processes
    [E 201008 17:18:28 web:2250] 200 POST /v1/models/pytorchmodel:predict (127.0.0.1) 21.34ms

In a separate terminal, you can run the client script, it will make the request:

    $ python3 pytorch_pytorchserver_client.py
    Files already downloaded and verified
    <Response [200]>
    ...

## Deploying model

We have a .json with `inferenceservice` defined:

    $ kubectl create -f pytorch_cifar10.yaml  -n kfserving-test
    inferenceservice.serving.kubeflow.org/pytorch-cifar10 created

Wait until the pods are running and the service is 'ready' and has URL:

    $ kubectl get po -n kfserving-test
    NAME                                                              READY   STATUS    RESTARTS   AGE
    pytorch-cifar10-predictor-default-x4597-deployment-6dd9d4bfnmqs   2/2     Running   0          119s

    $ k get inferenceservices -n kfserving-test
    NAME              URL                                                                           READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    pytorch-cifar10   http://pytorch-cifar10.kfserving-test.example.com/v1/models/pytorch-cifar10   True    100                                3m16s

Define the parameters you will be using in your requests:

    $ export MODEL_NAME=pytorch-cifar10
    $ export INPUT_PATH=@./pytorch_input.json
    $ export SERVICE_HOSTNAME=$(kubectl get inferenceservice pytorch-cifar10 -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

Depending on your environment, if you run on KFServing that is part of Kubeflow instalation(this is what we do thuought this lab):

    $ export INGRESS_HOST=$(kubectl -n istio-system get service kfserving-ingressgateway  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service kfserving-ingressgateway  -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

Or for more generic case:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
    
The `curl` call:    

    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" -d $INPUT_PATH http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict
    *   Trying 12.34.56.78...
    * Connected to 12.34.56.78 (12.34.56.78) port 80 (#0)
    > POST /v1/models/pytorch-cifar10:predict HTTP/1.1
    > Host: pytorch-cifar10.kfserving-test.example.com
    > User-Agent: curl/7.47.0
    > Accept: */*
    > Content-Length: 110681
    > Content-Type: application/x-www-form-urlencoded
    > Expect: 100-continue
    >
    < HTTP/1.1 100 Continue
    * We are completely uploaded and fine
    < HTTP/1.1 200 OK
    < content-length: 225
    < content-type: application/json; charset=UTF-8
    < date: Tue, 06 Oct 2020 21:43:45 GMT
    < server: istio-envoy
    < x-envoy-upstream-service-time: 14
    <
    * Connection #0 to host 12.34.56.78 left intact
    {"predictions": [[-1.6099601984024048, -2.6461071968078613, 0.3284444212913513, 2.4825074672698975, 0.4352457523345947, 2.3108041286468506, 1.0005676746368408, -0.42327627539634705, -0.5100944638252258, -1.7978390455245972]]}

For troubleshooting, see [Kubeflow website](https://github.com/kubeflow/kfserving/tree/master/docs/samples/pytorch)


## Links

- https://github.com/kubeflow/kfserving/tree/master/docs/samples/pytorch

---

[Back](Readme.md)
