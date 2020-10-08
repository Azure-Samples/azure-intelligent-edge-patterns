# KFServing TensorFlow models

## Building a model and running inference on it.

Before we plug in our models to KFServing, we can create our own model and we would
need to serialize it. As example we build a model based on Keras's `MobileNet`, serialize it, and show
how to load it ad create our own .npy input file for inferensing with cli.

 See [TensorFlow documentation about saving and loading models](https://www.tensorflow.org/guide/saved_model)
 for more detals. This is how it works(we skept a few lines for clarity):

    $ python3 tensorflow_custom_model.py
    020-10-07 20:32:09.913482: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcudart.so.10.1
    TensorFlow version: 2.3.1
    pciBusID: 0001:00:00.0 name: Tesla K80 computeCapability: 3.7
    Downloading data from https://storage.googleapis.com/download.tensorflow.org/example_images/grace_hopper.jpg
    65536/61306 [================================] - 0s 0us/step
    Downloading data from https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt
    16384/10484 [==============================================] - 0s 0us/step
    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/mobilenet/mobilenet_1_0_224_tf.h5
    17227776/17225924 [==============================] - 0s 0us/step
    2020-10-07 20:32:20.189468: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcudnn.so.7
    2020-10-07 20:32:27.640408: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcublas.so.10
    esult for test image: [458 835 907 452 544]
                          ['bow tie' 'suit' 'Windsor tie' 'bolo tie' 'dumbbell']
    Result before saving: [653 458 835 440 716]
                          ['military uniform' 'bow tie' 'suit' 'bearskin' 'pickelhaube']
    mobilenet_save_path is  build_models/mobilenet/1/
    infer. structured_outputs:  {'predictions': TensorSpec(shape=(None, 1000), dtype=tf.float32, name='predictions')}
    Result after saving and loading: ['military uniform' 'bow tie' 'suit' 'bearskin' 'pickelhaube']

You can now see the metadata of the saved model:

    $ saved_model_cli show --dir ./build_models/mobilenet/1/ --tag_set serve
    2020-10-07 20:41:58.110146: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcudart.so.10.1
    The given SavedModel MetaGraphDef contains SignatureDefs with the following keys:
    SignatureDef key: "__saved_model_init_op"
    SignatureDef key: "serving_default"

And you can see the details of the inputs:

    $ saved_model_cli show --dir ./build_models/mobilenet/1/ --tag_set 'serve' --signature_def serving_default
    2020-10-07 21:00:22.577704: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcudart.so.10.1
    The given SavedModel SignatureDef contains the following input(s):
    inputs['input_1'] tensor_info:
        dtype: DT_FLOAT
        shape: (-1, 224, 224, 3)
        name: serving_default_input_1:0
    The given SavedModel SignatureDef contains the following output(s):
    outputs['predictions'] tensor_info:
        dtype: DT_FLOAT
        shape: (-1, 1000)
        name: StatefulPartitionedCall:0
    Method name is: tensorflow/serving/predict

You can run this model using cli like so:

    $ saved_model_cli run --dir ./build_models/mobilenet/1/ --tag_set 'serve' --signature_def serving_default --inputs "input_1=mybowtie.npy"
    2020-10-07 22:09:05.114650: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcudart.so.10.1
    2020-10-07 22:09:06.590719: I tensorflow/stream_executor/platform/default/dso_loader.cc:48] Successfully opened dynamic library libcuda.so.1
    ...
    INFO:tensorflow:Restoring parameters from ./build_models/mobilenet/1/variables/variables
    ...
    1.03344687e-10 1.75437484e-10 5.70104797e-10 2.57304542e-08
    9.80437953e-10 6.50071597e-09 7.63548336e-10 2.22535121e-07
    2.11364273e-10 1.93390726e-09 1.75153725e-09 3.15297433e-09
    3.13854276e-10 1.25729163e-10 1.90465019e-10 2.17428101e-06
    3.23613469e-09 6.73297507e-09 1.32053316e-07 7.10744175e-08
    1.44242229e-09 9.99776065e-01 1.08120508e-08 2.66501246e-07    <------------- here is the bow tie, 0.99976
    5.10951594e-11 2.09783249e-08 2.71486139e-10 4.61643097e-08
    4.05468148e-09 1.06352536e-06 1.00858000e-09 6.74229839e-11
    2.58849914e-10 2.56112132e-09 3.45258333e-09 2.42699444e-10
    6.64567623e-10 9.48480761e-09 8.73305410e-08 1.71701653e-10
    4.04795251e-12 2.47852516e-09 5.37987823e-08 1.00287258e-10
    ...


## Deploying model

To deploy a model, you need to create the `inferenceservice`:

    $ kubectl create -f tensorflow_flowers.yaml  -n kfserving-test
    inferenceservice.serving.kubeflow.org/flowers-sample configured

Give it some time to create the pods. You should eventually see it with `READY` state, and URL:

    $ kubectl get inferenceservices -n kfserving-test
    NAME             READY     URL                                         DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    flowers-sample   True      http://flowers-sample.default.example.com   90                10               48s

Now, you can identify the host and port to make requests to:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

And define the model you want to interact with(for the `curl` we compose later):

    $ export MODEL_NAME=flowers-sample
    $ export INPUT_PATH=@./tensorflow_input.json
    $ export SERVICE_HOSTNAME=$(kubectl get inferenceservice ${MODEL_NAME} -n kfserving-test -o jsonpath='{.status.url}' | cut -d "/" -f 3)

Do the inferencing itself:

    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/$MODEL_NAME:predict -d $INPUT_PATH
    *   Trying 12.34.56.78...
    * Connected to 12.34.56.78 (12.34.56.78) port 80 (#0)
    > POST /v1/models/flowers-sample:predict HTTP/1.1
    > Host: flowers-sample.kfserving-test.example.com
    > User-Agent: curl/7.47.0
    > Accept: */*
    > Content-Length: 16201
    > Content-Type: application/x-www-form-urlencoded
    > Expect: 100-continue
    >
    < HTTP/1.1 100 Continue
    * We are completely uploaded and fine
    < HTTP/1.1 200 OK
    < content-length: 221
    < content-type: application/json
    < date: Tue, 06 Oct 2020 17:24:59 GMT
    < x-envoy-upstream-service-time: 331
    < server: istio-envoy
    <
    {
        "predictions": [
            {
                "scores": [0.999114931, 9.20987877e-05, 0.000136786475, 0.00033725836, 0.000300533167, 1.84813962e-05],
                "prediction": 0,
                "key": "   1"
            }
        ]
    * Connection #0 to host 12.34.56.78 left intact
    }

    See Tensorflow rest api documentation on constructing and interpreting the json inpu/output.

## Links

- https://www.tensorflow.org/guide/saved_model
- https://www.tensorflow.org/tfx/serving/api_rest
- https://www.tensorflow.org/tfx/tutorials/serving/rest_simple

[Back](Readme.md)