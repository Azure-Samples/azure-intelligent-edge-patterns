# KFServing using Triton

[Nvidia Inference Server Triton](https://developer.nvidia.com/nvidia-triton-inference-server) is a high-performing
batch-inferencing deployment we can start using KFServing.

We will be following examples from KFServing Github repository, and encourage you to look at
other examples if you face any problems: https://github.com/kubeflow/kfserving/tree/master/docs/samples

BERT(Bidirectional Embedding Representations from Transformers), is working on Natural Language Processing tasks.

# Pre-requisites

You need to have Kubeflow version 1.2 or later, which should have KFServing version 0.4 or later.

Earlier name used for `Triton` was `TensorRT`, it may not be compatible with what we will be demoing.

# Preparing the environment

We have to make some changes to our environment.

We need to skip tag resolution for nvcr.io:

    $ kubectl patch cm config-deployment --patch '{"data":{"registriesSkippingTagResolving":"nvcr.io"}}' -n knative-serving

And increase the timeout for image pulling, because BERT model we will use is large

    $ kubectl patch cm config-deployment --patch '{"data":{"progressDeadline": "600s"}}' -n knative-serving

# (Optional) Extending `kfserving.KFModel`

You can define your own `pre/postprocess` and `predict` functions, and prepare the image for the transformer.

For the sake of simplicity we will use a pre-built image gcr.io/kubeflow-ci/kfserving/bert-transformer:latest.

If you want to build your own you can do this and update the image name in the .yaml:

    $ cd triton_bert_tokenizer
    $ docker build -t rollingstone/bert_transformer:latest . --rm

(replacing `rollingstone` with your own DockerHub account name  or an ACR of your choosing)

# Deploying the inferenceservice for Triton

If you remember, in our environment we created a separate namespace `kfserving-test` for inferencing,
we will deploy the Triton deployment into it, like so:

    $ kubectl create -f triton_bert.yaml -n kfserving-test
    inferenceservice.serving.kubeflow.org/bert-large created

You will need to wait until the `inferencingservice` will become `READY`. For troubleshooting
you can look at the health of the pods.

    $ kubectl get inferenceservice -n kfserving-test
    NAME         URL                                            READY   DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    bert-large   http://bert-large.kfserving-test.example.com   True    100                                1m

In a few minutes you should see something like this:

    $ kubectl get revision -l serving.kubeflow.org/inferenceservice=bert-large -n kfserving-test
    NAME                                   CONFIG NAME                      K8S SERVICE NAME                       GENERATION   READY   REASON
    bert-large-predictor-default-9jcrq     bert-large-predictor-default     bert-large-predictor-default-9jcrq     1            True
    bert-large-transformer-default-hvwjq   bert-large-transformer-default   bert-large-transformer-default-hvwjq   1            True

# Running inferencing

If you remember, BERT is working on NLP. The input we will give it will be a text question.

    $ cat triton_input.json
    {
    "instances": [
        "What President is credited with the original notion of putting Americans in space?"
    ]
    }

As with previous examples, we need to have the `INGRESS_HOST` and `INGRESS_PORT` defined. We used the following, but
in your environment it could be different depending on the flavor of your Kubernetes cluster and i/o layers within it:

    $ INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway  -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

And let us set the following:

    $ MODEL_NAME=bert-large
    $ INPUT_PATH=@./triton_input.json
    $ SERVICE_HOSTNAME=$(kubectl get inferenceservices -n kfserving-test bert-large -o jsonpath='{.status.url}' | cut -d "/" -f 3)

You should see the service `Alive`:

    $ curl -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}
    Alive

And now we can run the web requests for the inferencing server we created:

    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" -d $INPUT_PATH http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict
    *   Trying 12.34.56.78..
    * Connected to 12.34.56.78 (12.34.56.78) port 80 (#0)
    > POST /v1/models/bert-large:predict HTTP/1.1
    > Host: bert-large.kfserving-test.example.com
    > User-Agent: curl/7.47.0
    > Accept: */*
    > Content-Length: 110
    > Content-Type: application/x-www-form-urlencoded
    >
    * upload completely sent off: 110 out of 110 bytes
    < HTTP/1.1 200 OK
    < content-length: 61
    < content-type: application/json; charset=UTF-8
    < date: Thu, 19 Nov 2020 20:00:18 GMT
    < server: istio-envoy
    < x-envoy-upstream-service-time: 3814
    <
    * Connection #0 to host 12.34.56.78 left intact
    {"predictions": "John F. Kennedy", "prob": 77.91852121017916}

So, we got JFK with 78% certainty, which is reasonable.

If we ask "who put Americans in space?"

    $ curl -H "Host: ${SERVICE_HOSTNAME}" -d $INPUT_PATH http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict
    {"predictions": "Project Mercury", "prob": 71.40910962568026}

We get another reasonable answer. BERT is considered to produce state-of-art results on a wide array of NLP tasks.

# Links

- https://developer.nvidia.com/nvidia-triton-inference-server
- https://github.com/triton-inference-server/server
- https://docs.microsoft.com/en-us/azure/machine-learning/how-to-deploy-with-triton?tabs=python
- https://gunicorn.org/
- https://github.com/kubeflow/kfserving/tree/master/docs/samples


---

[Back](../Readme.md)
