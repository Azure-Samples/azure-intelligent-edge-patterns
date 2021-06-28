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
    [[8.14447232e-10 1.08833642e-09 3.05714520e-09 3.76422588e-10
    3.02461900e-09 1.86771834e-10 9.58564408e-11 2.23442289e-11
    ...
    1.03344687e-10 1.75437484e-10 5.70104797e-10 2.57304542e-08
    9.80437953e-10 6.50071597e-09 7.63548336e-10 2.22535121e-07
    2.11364273e-10 1.93390726e-09 1.75153725e-09 3.15297433e-09
    3.13854276e-10 1.25729163e-10 1.90465019e-10 2.17428101e-06
    3.23613469e-09 6.73297507e-09 1.32053316e-07 7.10744175e-08
    1.44242229e-09 9.99776065e-01 1.08120508e-08 2.66501246e-07    <------------- here is the bow tie, 0.99976, index 458
    5.10951594e-11 2.09783249e-08 2.71486139e-10 4.61643097e-08
    4.05468148e-09 1.06352536e-06 1.00858000e-09 6.74229839e-11
    2.58849914e-10 2.56112132e-09 3.45258333e-09 2.42699444e-10
    6.64567623e-10 9.48480761e-09 8.73305410e-08 1.71701653e-10
    4.04795251e-12 2.47852516e-09 5.37987823e-08 1.00287258e-10
    ...
    1.32482428e-11 6.76930595e-11 7.33395428e-11 1.21903876e-10
    8.87640048e-12 1.07872808e-10 5.34377209e-10 1.29179213e-07]]
    ...


## Deploying model

To deploy a model, you need to create the `inferenceservice`:

    $ kubectl create -f tensorflow_flowers.yaml  -n kfserving-test
    inferenceservice.serving.kubeflow.org/flowers-sample configured

Give it some time to create the pods. You should eventually see it with `READY` state, and URL:

    $ kubectl get inferenceservices -n kfserving-test
    NAME             READY     URL                                         DEFAULT TRAFFIC   CANARY TRAFFIC   AGE
    flowers-sample   True      http://flowers-sample.default.example.com   90                10               48s

Now, you can identify the host and port to make requests to, it [depends on your environment](https://github.com/kubeflow/kfserving).

For stand-alone KFServing using minikube:

    $ export INGRESS_HOST=$(minikube ip)
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

For KFServing deployment within Kubeflow:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service kfserving-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

For other stand-alone KFServing deployments:

    $ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    $ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

We also need to define the model you want to interact with(for the `curl` we compose later):

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

## Deploying custom model

The prepared sample model is stored at `gs://kfserving-samples/models/tensorflow/flowers`. The custom model you build yourself also
needs to be put into the location InferenceService CRD understands, which is, at the moment of writing this documentation, one of:
`gs://`, `s3://`, or `pvc://`.

For a detouched cluster, you could create a local storage using the `persistence.yaml` we provide in `sbin` folder, deploy it
in `kfserving-test` namespace like so:

    $ kubectl create -f persistence.yaml -n kfserving-test
    storageclass.storage.k8s.io/local-storage created
    persistentvolume/samba-share-volume created
    persistentvolumeclaim/samba-share-claim created

You should see the volume claims:

    $ kubectl get pvc -n kfserving-test
    NAME                STATUS   VOLUME               CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    samba-share-claim   Bound    samba-share-volume   2Gi        RWX            local-storage   16h

And the volume itself:

    $ kubectl get pv -n kfserving-test
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                              STORAGECLASS    REASON   AGE
    ...
    samba-share-volume                         2Gi        RWX            Retain           Bound    kfserving-test/samba-share-claim   local-storage            16h

Then you can copy your model from the `build_models` to where your pvc points to, and mark it in your deployment .yaml, like so:

    $ cat tensorflow_custom_model.yaml
    apiVersion: "serving.kubeflow.org/v1alpha2"
    kind: "InferenceService"
    metadata:
    name: "custom-model"
    spec:
    default:
        predictor:
        tensorflow:
            #storageUri: "gs://rollingstone/mobilenet"
            storageUri: "pvc://samba-share-claim/mymodels/build_models/mobilenet"


## Inferencing using custom model

See [Tensorflow rest api documentation](https://www.tensorflow.org/tfx/serving/api_rest) on constructing and interpreting the json inpu/output.

For example, for the custom model we created earlier, we would need to define the instances with `input_1`.
We can feed the 3-dimensional array with pixel values like so (see script `tensorflow_web_infer.py` for implementation suggestions):
    
    {
        "instances":[
            {"input_1":[[
                [25, 28, 82], [29, 31, 91], [27, 28, 95], [28, 27, 96],
                ...
                [13, 12, 18]
                ]]
            }
        ]
    }

And we should get the predictions. 

    {
    "predictions": [[7.41982103e-06, 0.00287958328, 0.000219230162, 4.96962894e-05,
    ...
    ]]
    }

It is up to the user of the api to pre-process the input and to post-process the results according to the application's needs.
See `tensorflow_web_infer.py` for example of how to pick the right index and get the label for your model.

## Links

- https://www.tensorflow.org/guide/saved_model
- https://www.tensorflow.org/tfx/serving/api_rest
- https://www.tensorflow.org/tfx/tutorials/serving/rest_simple

---

[Back](Readme.md)
