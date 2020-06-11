# Tensorflow on Kubeflow on Azure Stack

This module demonstrates how to run TensorFlow jobs on Kubeflow cluster on Azure Stack.

[TensorFlow](https://www.tensorflow.org/) is a popular open source machine learning framework.
It was initially developed by the Google Brain team for internal Google use, and later released under
the Apache License 2.0.

# Prerequisites

Previous familiarity with the following is recommended:

- [Kubernetes](https://kubernetes.io/)
- [Docker](https://www.docker.com/)
- [TensorFlow](https://tensorflow.org/)
- [Azure](http://azure.com)
- [Kubeflow](https://github.com/kubeflow/kubeflow)

For obvious reasons, distributed training of the models is easier to see if the cluster has more than one node in its pool, and, respectively, at least that amount of the replicas for the worker conterner instances.

# Installation

Please see the `Kubeflow on Azure Stack` module of this repository, or [https://www.kubeflow.org](https://www.kubeflow.org) for details of using Kubeflow and installing it on Azure or Azure Stack.

`TFJob` is a custom workload, and you should see it among the registered custom resources:

    azureuser@k8s-master-36519982-0:~$ kubectl get crd | grep tfjob
    tfjobs.kubeflow.org          2020-05-06T01:30:30Z

It is also recommended, but not necessary, to have Kubernetes Dashboard running on the cluster.


# Building Docker image for distributed mnist model for e2e test

We will run a popular scenario from Kubeflow's repository, 
[K8s Custom Resource and Operator For TensorFlow jobs](https://github.com/kubeflow/tf-operator/)

You do not have to re-build the image, you can use `kubeflow/tf-dist-mnist-test:1.0`. If you do decide to use your own image, here is how you could build it:

    $ cd tensorflow-on-kubeflow/dist-mnist-e2e-test

Login to your Docker account:

    $ docker login
    ... enter the credentials if needed ...

Build the image:

    $ docker build -f Dockerfile -t rollingstones/tf-dist-mnist-test:1.0 ./
    Sending build context to Docker daemon  18.94kB
    Step 1/3 : FROM tensorflow/tensorflow:1.5.0
    1.5.0: Pulling from tensorflow/tensorflow
    1be7f2b886e8: Pull complete
    ...
    7cec7dc064fc: Pull complete     
    Digest: sha256:273cd3c514feb7f93efa3c3e03361969dd3276dbe8267482eb67f5921fb66c0b
    Status: Downloaded newer image for tensorflow/tensorflow:1.5.0
    ---> a2d1671e8a93
    Step 2/3 : ADD . /var/tf_dist_mnist
    ---> 0cb4d841948b
    Step 3/3 : ENTRYPOINT ["python", "/var/tf_dist_mnist/dist_mnist.py"]
    ---> Running in 7defb9c160d7
    Removing intermediate container 7defb9c160d7
    ---> b9fc305fb63a
    Successfully built b9fc305fb63a
    Successfully tagged rollingstones/tf-dist-mnist-test:1.0

And to push to DockerHub or another container registry or artifactory:

    $ docker push rollingstones/tf-dist-mnist-test:1.0
    The push refers to repository [docker.io/rollingstones/tf-dist-mnist-test]
    ce40b6a5f992: Pushed 
    c04a36d9e118: Mounted from tensorflow/tensorflow
    ...
    sha256:af441000275fe99aa463d36a814c1b3b38a7d5de45a131f38d97971119730a6a size: 3038

# Running a TFJob

Create a tf_job_mnist-e2e-test.yaml file:

    apiVersion: "kubeflow.org/v1"
    kind: "TFJob"
    metadata:
      name: "dist-mnist-for-e2e-test-demo"
    spec:
      tfReplicaSpecs:
        PS:
          replicas: 1
          restartPolicy: OnFailure
          template:
            spec:
              containers:
                - name: tensorflow
                  image: rollingstones/tf-dist-mnist-test:1.0
        Worker:
          replicas: 3
          restartPolicy: OnFailure
          template:
            spec:
            containers:
              - name: tensorflow
                image: rollingstones/tf-dist-mnist-test:1.0

To run a TFJob:

    $ kubectl create -f tf_job_mnist-e2e-test.yaml

You should see the pods being initialized, then running, and, finally, getting to status `Completed`:

    $ kubeclt get pods
    NAME                                    READY   STATUS             RESTARTS   AGE
    dist-mnist-for-e2e-test-demo-worker-0     0/1     Completed          0          9m21s
    dist-mnist-for-e2e-test-demo-worker-1     0/1     Completed          0          9m21s
    dist-mnist-for-e2e-test-demo-worker-2     0/1     Completed          0          9m21s

Here is an example of the log on a worker node:

    $ kubectl logs dist-mnist-for-e2e-test-demo-worker-0
    /usr/local/lib/python2.7/dist-packages/h5py/__init__.py:36: FutureWarning: Conversion of the second argument of issubdtype from `float` to `np.floating` is deprecated. In future, it will be treated as `np.float64 == np.dtype(float).type`.
    from ._conv import register_converters as _register_converters
    2020-05-13 19:30:28.384657: I tensorflow/core/platform/cpu_feature_guard.cc:137] Your CPU supports instructions that this TensorFlow binary was not compiled to use: SSE4.1 SSE4.2 AVX AVX2 AVX512F FMA
    2020-05-13 19:30:28.385503: I tensorflow/core/distributed_runtime/rpc/grpc_channel.cc:215] Initialize GrpcChannelCache for job ps -> {0 -> dist-mnist-for-e2e-test-my-ps-0.default.svc:2222}
    2020-05-13 19:30:28.385534: I tensorflow/core/distributed_runtime/rpc/grpc_channel.cc:215] Initialize GrpcChannelCache for job worker -> {0 -> localhost:2222, 1 -> dist-mnist-for-e2e-test-my-worker-1.default.svc:2222, 2 -> dist-mnist-for-e2e-test-my-worker-2.default.svc:2222}
    2020-05-13 19:30:28.386049: I tensorflow/core/distributed_runtime/rpc/grpc_server_lib.cc:324] Started server with target: grpc://localhost:2222
    WARNING:tensorflow:From /var/tf_dist_mnist/dist_mnist.py:239: __init__ (from tensorflow.python.training.supervisor) is deprecated and will be removed in a future version.
    Instructions for updating:
    Please switch to tf.train.MonitoredTrainingSession
    2020-05-13 19:30:37.526195: I tensorflow/core/distributed_runtime/master_session.cc:1017] Start master session 1ddfe25446c51488 with config: device_filters: "/job:ps" device_filters: "/job:worker/task:0" allow_soft_placement: true
    Successfully downloaded train-images-idx3-ubyte.gz 9912422 bytes.
    Extracting /tmp/mnist-data/train-images-idx3-ubyte.gz
    Successfully downloaded train-labels-idx1-ubyte.gz 28881 bytes.
    Extracting /tmp/mnist-data/train-labels-idx1-ubyte.gz
    Successfully downloaded t10k-images-idx3-ubyte.gz 1648877 bytes.
    Extracting /tmp/mnist-data/t10k-images-idx3-ubyte.gz
    Successfully downloaded t10k-labels-idx1-ubyte.gz 4542 bytes.
    Extracting /tmp/mnist-data/t10k-labels-idx1-ubyte.gz
    job name = worker
    task index = 0
    Worker 0: Initializing session...
    Worker 0: Session initialization complete.
    Training begins @ 1589398237.717394
    1589398237.837679: Worker 0: training step 1 done (global step: 0)
    1589398237.849407: Worker 0: training step 2 done (global step: 1)
    1589398237.860992: Worker 0: training step 3 done (global step: 2)
    ...
    1589398297.489717: Worker 0: training step 5745 done (global step: 19996)
    1589398297.505792: Worker 0: training step 5746 done (global step: 19997)
    1589398297.517557: Worker 0: training step 5747 done (global step: 20000)
    Training ends @ 1589398297.517635
    Training elapsed time: 59.800241 s
    After 20000 training step(s), validation cross entropy = 2882.02


What is worth pointing out is that the nodes are being assigned individual indices:

    2020-05-13 19:30:28.385503: I tensorflow/core/distributed_runtime/rpc/grpc_channel.cc:215] Initialize GrpcChannelCache for job ps -> {0 -> dist-mnist-for-e2e-test-my-ps-0.default.svc:2222}
    2020-05-13 19:30:28.385534: I tensorflow/core/distributed_runtime/rpc/grpc_channel.cc:215] Initialize GrpcChannelCache for job worker -> {0 -> localhost:2222, 1 -> dist-mnist-for-e2e-test-my-worker-1.default.svc:2222, 2 -> dist-mnist-for-e2e-test-my-worker-2.default.svc:2222}
    2020-05-13 19:30:28.386049: I tensorflow/core/distributed_runtime/rpc/grpc_server_lib.cc:324] Started server with target: grpc://localhost:2222

# Building Docker image for mnist TFJob with summaries

We can run another sample, and use a mounted volume to save the summaries.


# Links

For further information:

- https://www.kubeflow.org/docs/components/training/tftraining/
- https://www.tensorflow.org/
