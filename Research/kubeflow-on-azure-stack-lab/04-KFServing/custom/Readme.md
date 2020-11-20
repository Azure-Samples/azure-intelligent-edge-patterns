# KFServing a custom-made Inference Service

We will be following an example from [KFServing Github repository](https://github.com/kubeflow/kfserving/tree/master/docs/samples),
and encourage you to try the others.

## Pre-requisites.

I you ran other examples, no special changes needed, you should already have:

- your own DockerHub account(or another ACR credentials). We will use `rollingstone`.
- at some point you will need `INGRESS_HOST` and `INGRESS_PORT` - they are system-dependent. Find out 
  how to retrieve them in your case at [KFServing website](https://github.com/kubeflow/kfserving/blob/master/README.md#determine-the-ingress-ip-and-ports).

## Building the image

You can implement your model inferencing in any languge you want. For clarity, we simulate it with
a simple [Flask server](https://palletsprojects.com/p/flask/) that listens on port 8080 and serves the call to `predict`:

    import os
    from flask import Flask

    app = Flask(__name__)

    @app.route('/v1/models/custom-sample:predict')
    def hello_world():
        greeting_target = os.environ.get('GREETING_TARGET', 'World')
        return 'Hello {}!\n'.format(greeting_target)

    if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))

Then we run it using [Gunicorn](https://gunicorn.org/) in a basic Python image:

    # Use the official lightweight Python image.
    # https://hub.docker.com/_/python
    FROM python:3.7-slim

    # Copy local code to the container image.
    ENV APP_HOME /app
    WORKDIR $APP_HOME
    COPY app.py requirements.txt ./

    # Install production dependencies.
    RUN pip install --no-cache-dir -r ./requirements.txt

    # Run the web service on container startup. Here we use the gunicorn
    # webserver, with one worker process and 8 threads.
    # For environments with multiple CPU cores, increase the number of workers
    # to be equal to the cores available.
    CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 app:app

Here are the idiomatic ways of building and uploading this image, you need to have your own
login to the container registry of your choosing(for example, replace `rollingstone` below
with your DockerHub account name):

    $ docker build -t rollingstone/custom-sample:1.0 .
    Sending build context to Docker daemon  8.704kB
    Step 1/6 : FROM python:3.7-slim
    3.7-slim: Pulling from library/python
    852e50cd189d: Pull complete
    877945f69fdf: Pull complete
    ...
    Successfully built 123454
    Successfully tagged rollingstone/custom-sample:1.0

Pushing:

    $ docker push rollingstone/custom-sample:1.0
    The push refers to repository [docker.io/rollingstone/custom-sample]
    e6f143d82fa2: Pushed
    eaa2cfe85360: Pushed
    ...

## Deploying the service

For the Kubernetes deployment let us create a `custom.yaml` file, where we mention our
image name.

    apiVersion: serving.kubeflow.org/v1alpha2
    kind: InferenceService
    metadata:
      labels:
        controller-tools.k8s.io: "1.0"
      name: custom-sample
    spec:
      default:
        predictor:
          custom:
            container:
              name: custom
              # Put your own container registry and image name.
              # For example if your Dockerhub login is 'rollingstone', type this:
              # image: rollingstone/custom-sample:1.0
              image: rollingstone/custom-sample:1.0
              env:
                - name: GREETING_TARGET
                  value: "Yay, we are using KFServing!"

You can deploy it like so(in the namespace we use for kfserving, `kfserving-test`):

    $ kubectl create -f custom.yaml -n kfserving-test
    inferenceservice.serving.kubeflow.org/custom-sample created

And in a few minutes, after the images are downloaded and service is up, you should see it in `READY` state:

    $ kubectl get inferenceservice -n kfserving-test
    NAME            URL                                                                       READY   DEFAULT TRAFFIC   AGE
    custom-sample   http://custom-sample.kfserving-test.example.com/v1/models/custom-sample   True    100               37s

## Running inference

For convenience, let us define some environment variables:

    $ MODEL_NAME=custom-sample
    $ SERVICE_HOSTNAME=$(kubectl get inferenceservice -n kfserving-test ${MODEL_NAME} -o jsonpath
='{.status.url}' | cut -d "/" -f 3)

It should look like this:

    $ echo $MODEL_NAME
    custom-sample
    $ echo $SERVICE_HOSTNAME
    custom-sample.kfserving-test.example.com

And we are ready to do the web api calls to that inference service:

    $ curl -v -H "Host: ${SERVICE_HOSTNAME}" http://${INGRESS_HOST}:${INGRESS_PORT}/v1/models/${MODEL_NAME}:predict
    *   Trying 12.34.56.78...
    * Connected to 12.34.56.78 (12.34.56.78) port 80 (#0)
    > GET /v1/models/custom-sample:predict HTTP/1.1
    > Host: custom-sample.kfserving-test.example.com
    > User-Agent: curl/7.47.0
    > Accept: */*
    >
    < HTTP/1.1 200 OK
    < content-length: 31
    < content-type: text/html; charset=utf-8
    < date: Wed, 18 Nov 2020 21:33:40 GMT
    < server: istio-envoy
    < x-envoy-upstream-service-time: 7705
    <
    Yay, we are using KFServing!
    * Connection #0 to host 12.34.56.78 left intact

If you get anything other than HTTP responce 200, check your firewall settings and the network configuration on your cluster.

## Links

- https://www.tensorflow.org/guide/saved_model
- https://github.com/kubeflow/kfserving/tree/master/docs/samples/onnx
- https://gunicorn.org/
- https://palletsprojects.com/p/flask/

---

[Back](../Readme.md)
