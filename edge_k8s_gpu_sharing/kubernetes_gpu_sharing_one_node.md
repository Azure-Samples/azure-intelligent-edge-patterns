# GPU Sharing on a one-node Kubernetes cluster on a VM

This demo shows how to deploy multiple gpu-requiring workloads on a cluster with fewer gpu devices than requested.

## Pre-requisites

Follow the instructions in [Prep steps for Docker and Kubernetes](prep_steps_for_docker_and_k8s.md)
to make sure you have a GPU-capable node on your vm.

If you need to install docker, follow the instructions at [Nvidia cloud native containers](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).

And if you need to install the drivers, see [Azure VM driver setup](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/n-series-driver-setup) or related. You might have to upgrade your system and/or drivers to work.

Please see [NVIDIA webpage](https://docs.nvidia.com/datacenter/kubernetes/kubernetes-upstream/index.html#kubernetes-run-a-workload) if you have any problems.

Before moving forward, you should be able to run nvidia-smi:

    $ sudo docker run --rm --runtime=nvidia nvidia/cuda nvidia-smi
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 418.87.01    Driver Version: 418.87.01    CUDA Version: 11.0     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla K80           On   | 0000DE85:00:00.0 Off |                    0 |
    | N/A   39C    P8    25W / 149W |      0MiB / 11441MiB |      0%      Default |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |  No running processes found                                                 |
    +-----------------------------------------------------------------------------+

Once you installed `microk8s` as in our demo [Deploying model to Kubernetes](../machine-learning-notebooks/deploying-on-k8s/Readme.md),
you should also be able to see `nvidia-smi` from within a pod:

    $ kubectl exec -it gpu-pod nvidia-smi
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 384.125                Driver Version: 384.125                   |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla V100-SXM2...  On   | 00000000:00:1E.0 Off |                    0 |
    | N/A   34C    P0    20W / 300W |     10MiB / 16152MiB |      0%      Default |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |  No running processes found                                                 |
    +-----------------------------------------------------------------------------+

If it does not work, please check the instructions at Nvidia's examples page, https://github.com/NVIDIA/k8s-device-plugin/blob/examples/workloads/pod.yml

For generality, we will be using `kubectl` instead of `microk8s.kubectl`, and you are encouraged to alias it to a shortcut.

You also need AzureML subscription, and ability to run Jupyter notebooks to create container images.

## Traditional way of defining resource limits

An average deployment in Kubernetes and common CRDs use `resources->limits` to specify memory/cpu/gpu/etc, for example,
in a deployment .yaml these entries would request an allocation of one gpu device, 200 millicpu (0.2 or 20% of the cpu), and 128 MB:

    ...
              resources: 
                limits:
                  memory: "128Mi"
                  cpu: "200m"
                  nvidia.com/gpu: 1
    ...

To damonstrate this, let's deploy one of our previous models from [machine-learning-notebooks/deploying-on-k8s](../machine-learning-notebooks/deploying-on-k8s/Readme.md),
you will need to run this notebook to create the container image: [machine-learning-notebooks/deploying-on-k8s/production-deploy-to-k8s-gpu.ipynb](../machine-learning-notebooks/deploying-on-k8s/production-deploy-to-k8s-gpu.ipynb).

`deploy_infer.yaml` will look like this:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-infer
  labels:
    app: my-infer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-infer
  template:
    metadata:
      labels:
        app: my-infer
    spec:
      containers:
      - name: my-infer
        image: myregistry.azurecr.io/rollingstone/myinfer:1.0
        ports:
        - containerPort: 5001
        - containerPort: 8883
        - containerPort: 8888
        resources:
          limits:
            nvidia.com/gpu:  1
      imagePullSecrets:
        - name: secret4acr2infer
```


To deploy it, let us create a namespace `myasetest1`, and deploy to it:

    $ kubectl create namespace myasetest1
    $ kubectl create -f deploy_infer.yaml -n myasetest1

And expose its port:

    $ kubectl expose deployment my-infer --type=LoadBalancer --name=my-service-infer -n myasetest1
    service/my-service-infer exposed

You should see the deployment, pods, services, etc.:

    $ kubeclt get deployment -n myasetest1
    NAME       READY   UP-TO-DATE   AVAILABLE   AGE
    my-infer   1/1     1            1           1m

Take a not of the external IP:

    $ kubectl get service -n myasetest1
    NAME               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                                        AGE
    ...
    my-service-infer   LoadBalancer   10.12.34.56      123.45.67.89  5001:30372/TCP,8883:32004/TCP,8888:31221/TCP   1m
    ...

You need to put this ip into `runtest_infer.py`, instead of `<put your ip here>`, and you will be able to run the inference:

    $ python runtest_infer.py
    test_sample size is 62821
    Found: snow leopard, ounce, Panthera uncia

## Reaching limits of available GPUs

If you attemppt to create another deployment that asks for more GPUs than there is avalable, you should get an error.

For, example, see what kind of an error you get when attempting to run this:

    $ kubectl create -f deploy_infer_GPU_GREED.yaml -n myasetest1

Unless your system has more than 101 gpu device, you should see your pod freeze in `Pending` state, and event
indicate insufficient resource:

    ...
    Events:
    Type     Reason            Age        From               Message
    ----     ------            ----       ----               -------
    Warning  FailedScheduling  <unknown>  default-scheduler  0/2 nodes are available: 100 Insufficient nvidia.com/gpu.
    Warning  FailedScheduling  <unknown>  default-scheduler  0/2 nodes are available: 100 Insufficient nvidia.com/gpu.
    ...

    $ kubectl get pods -n myasetest1
    NAMESPACE      NAME                                         READY   STATUS      RESTARTS   AGE
    myasetest1     my-infer-f79869b88-vfbnx                     1/1     Running     0          41m
    myasetest1     my-infer-gpugreed-5c88f68f6b-c9gd5           0/1     Pending     0          9m

You can delete it like so:

    $ kubectl delete -f deploy_infer_GPU_GREED.yaml -n myasetest1

Let us also delete the first deployment we did and the service we created for it, we will do it differently.

    $ kubectl delete -f deploy_infer.yaml -n myasetest1
    $ kubectl delete service my-service-infer -n myasetest1

## Defining GPU device visibility

There is an alternative that allows a fractional allocation of GPU resources, called Multi-Process Service (MPS).

The allocation is done via environment variable to the Kubernetes GPU operator, so, without requesting a resource limit,
you define a value for `NVIDIA_VISIBLE_DEVICES`, which determins which device is requested to be used for the container.

For example, if we wanted to make our previous deployments work, it could have looked like this:

    ...
    containers:
    - name: my-infer2
      resources:
        limits:
          # nvidia.com/gpu:  1           <---------- Commenting this out
      env:
      - name: NVIDIA_VISIBLE_DEVICES     <---------- adding this instead,
        value: "0"                       <           means "use device 0"
    ...

Here is how `deploy_infer2.yaml` looks like. Note that it uses the same container image from before,
but has its own naming, we append suffix '2':

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-infer2
  labels:
    app: my-infer2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-infer2
  template:
    metadata:
      labels:
        app: my-infer2
    spec:
      containers:
      - name: my-infer2
        image: myregistry.azurecr.io/rollingstone/myinfer:1.0
        env:
        - name: NVIDIA_VISIBLE_DEVICES
          # "0" means device 0, not "do not use gpu".
          value: "0"
        ports:
        # we use only 5001, but the container exposes  EXPOSE 5001 8883 8888
        - containerPort: 5001
        - containerPort: 8883
        - containerPort: 8888
        resources:
          limits:
            # not using gpu allocation via `limits`, using NVIDIA_VISIBLE_DEVICES env.
            # nvidia.com/gpu:  1
      imagePullSecrets:
        - name: secret4acr2infer
```

Run it like so:

    $ kubectl create -f deploy_infer2.yaml -n myasetest1
    deployment/my-infer2 created
    $ kubectl expose deployment my-infer2 --type=LoadBalancer --name=my-service-infer2 -n myasetest1
    service/my-service-infer exposed

Take a not of the external IP:

    $ kubectl get service -n myasetest1
    NAME               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                                        AGE
    ...
    my-service-infer2   LoadBalancer  10.12.34.56      123.45.67.89  5001:30372/TCP,8883:32004/TCP,8888:31221/TCP   1m
    ...

You need to put this ip into `runtest_infer.py`, instead of `<put your ip here>`, and you will be able to run the inference:

    $ python runtest_infer.py
    test_sample size is 62821
    Found: snow leopard, ounce, Panthera uncia

## Adding deploy_infer3.yaml

Let us add another deployment `deploy_infer3.yaml`, which uses the same container image from before. It will be
different from the last one we created by the append suffix '3' instead of '2':

    $ kubectl create -f deploy_infer3.yaml -n myasetest1
    deployment/my-infer3 created
    $ kubectl expose deployment my-infer3 --type=LoadBalancer --name=my-service-infer3 -n myasetest1
    service/my-service-infer exposed

Now you should be able to see both services running. Take a not of the external IP for the `my-service-infer3`:

    $ kubectl get service -n myasetest1
    NAME               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                                        AGE
    ...
    my-service-infer2   LoadBalancer  10.12.34.56      123.45.67.89  5001:30372/TCP,8883:32004/TCP,8888:31221/TCP   1m
    my-service-infer3   LoadBalancer  10.12.34.56      123.45.67.90  5001:30372/TCP,8883:32004/TCP,8888:31221/TCP   1m
    ...

You can run inference against the second service using `runtest_infer.py` as you did with the first service.

## Observing GPU metrics

Now, that you created two GPU-using deployments, you should see at least two processes on gpu:

    $ nvidia-smi
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 440.64.00    Driver Version: 440.64.00    CUDA Version: 10.2     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla T4            On   | 00008439:00:00.0 Off |                    0 |
    | N/A   62C    P0    30W /  70W |  14700MiB / 15109MiB |      7%      Default |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |    0     46565      C   ...b7ee7d45e4sderhwrh/bin/python           14011MiB |
    |    0     76365      C   ...b7ee7d45e44b2b71c805b14ad4d9/bin/python 19011MiB |
    +-----------------------------------------------------------------------------+

And you can validate them functioning by running inferences on deployed models simulataneously.

Once you put the EXTERNAL-IPs to `runtest_infer2.py` and `runtest_infer3.py`, instead of `<put your ip here>`,
and you will be able to run the inferences, at the same time in different terminals or in background.
Those scripts send batches of requests to the inference engines, so the logs will be longer, and you
can get the benchmarks:

    $ python runtest_infer2.py
    scoring_uri is http://123.45.67.89:5001/score
    test_sample1 size is 62821
    test_sample2 size is 188183
    0:  Found a :: snow leopard, ounce, Panthera uncia
    1:  Found a :: cheeseburger
    2:  Found a :: snow leopard, ounce, Panthera uncia
    3:  Found a :: cheeseburger
    4:  Found a :: snow leopard, ounce, Panthera uncia
    ... cut ...
    97:  Found a :: cheeseburger
    98:  Found a :: snow leopard, ounce, Panthera uncia
    99:  Found a :: cheeseburger
    Time elapsed: 16.8993826 seconds

The GPU utilization should be better with running multiple models, so the asynchronous runs
of, say `runtest_infer3.py` on the second deployment, should be faster than the sequential.

## Adding yet another workload to the same device

Let's add even more GPU workload, an example from https://nvidia.github.io/gpu-operator/

Deploy notebook server like so, and forward the port so we could browse the notebook:

    $ kubectl create -f .\tf-notebook.yaml -n myasetest1
    service/tf-notebook created
    pod/tf-notebook created
    $ kubectl port-forward tf-notebook 8888:8888 -n myasetest1

Before you open the notebook look at the logs to get the token you will need to connect.

    $ kubectl logs -f tf-notebook -n myasetest1
    ...
       Or copy and paste one of these URLs:
        http://tf-notebook:8888/?token=c3eef2cc5044695641177a89bdb0a8d473e9f6f9e26451bf
        or http://127.0.0.1:8888/?token=c3eef2cc5044695641177a89bdb0a8d473e9f6f9e26451bf
    ...

Open browser on http://127.0.0.1:8888 (or, with the token) and you should see the notebook:

![pics/notebook_snapshot.png](pics/notebook_snapshot.png)

And you should see all three processes in Edge-device analog of nvidia-smi:

    $ nvidia-smi
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 440.64.00    Driver Version: 440.64.00    CUDA Version: 10.2     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla T4            On   | 00008439:00:00.0 Off |                    0 |
    | N/A   60C    P0    30W /  70W |  14436MiB / 15109MiB |      0%      Default |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |    0     79811      C   ...b7ee7d45easgasrgqergasrgfsd9/bin/python  1057MiB |
    |    0    190519      C   python3                                      355MiB |
    |    0    198661      C   ...b7ee7d45e44b2b71c8argfdrfash/bin/python 13013MiB |
    +-----------------------------------------------------------------------------+

All processes are running on GPU 0, as we defined them.

## Deleting all deployments

To clean the environment from what we created, we need to delete the deployments and services:

    $ kubectl delete deployment my-infer2 -n mynamespace
    $ kubectl delete deployment my-infer3 -n mynamespace
    $ kubectl delete service my-service-infer2 -n mynamespace
    $ kubectl delete service my-service-infer3 -n mynamespace

    $ kubectl delete -f .\tf-notebook.yaml -n myasetest1

# Links

  - https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#view-gpu-driver-information
  - https://nvidia.github.io/gpu-operator/
  - https://github.com/NVIDIA/k8s-device-plugin/blob/examples/workloads/pod.yml
  - [Deploying model to Kubernetes](../machine-learning-notebooks/deploying-on-k8s/Readme.md)
