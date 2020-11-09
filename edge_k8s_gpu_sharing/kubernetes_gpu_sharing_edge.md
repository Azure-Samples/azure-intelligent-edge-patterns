# Edge Kubernetes GPU Sharing

This demo shows how to deploy multiple gpu-requiring workloads on a cluster with fewer gpu devices than requested.

## Pre-requisites

You need an Edge device.

For this exercise we want to run a shell on the device, the following is run in an admin PowerShell window of
your controlling machine(jumpbox):

    > winrm quickconfig
    > $ip = "<your_device_ip>"
    > Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
    > Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell

You will be asked for the password(which you should have if a device access was provisioned)

For more details see [Remotely connect to device from a Windows client](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#remotely-connect-from-a-windows-client)

Or, for Linux environments, [Remotely connect to device from a Linux client](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#remotely-connect-from-a-linux-client)

You should be able to see the device info from the device shell:

    [10.100.10.10]: PS>Get-HcsApplianceInfo
    ...
    Id                            : ...
    Name                          : ...
    SerialNumber                  : ...
    DeviceId                      : ...
    Model                         : ...
    SystemState                   : Initialized
    SystemStatus                  : Normal
    ...

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

You can delete it like so:

    $ kubectl delete -f deploy_infer_GPU_GREED.yaml -n myasetest1

Let us also delete the first deployment we did and the service we created for it, we will do it differently.

    $ kubectl delete -f deploy_infer.yaml -n myasetest1
    $ kubectl delete service my-service-infer -n myasetest1

## Defining GPU device visibility

There is an alternative that allows a fractional allocation of GPU resources. It is a preview feature for
Azure Stack Edge Pro, called Multi-Process Service (MPS).

To enable it(once you have 
[activated your azure Stack Edge Pro device](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-activate),
and [configured compute on that device in the portal](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-configure-compute#configure-compute)):

    > Start-HcsGpuMPS

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

    [xx.xx.xx.xx]: PS>Get-HcsGpuNvidiaSmi
    K8S-ddddddddd-ddddddd:

    Mon Nov  2 18:13:15 2020
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

    [123.45.67.89]: PS>Get-HcsGpuNvidiaSmi
    
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
