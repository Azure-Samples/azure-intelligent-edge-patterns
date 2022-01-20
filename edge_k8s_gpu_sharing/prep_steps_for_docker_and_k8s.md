# Prep steps for Docker and Kubernetes

These are many ways to deploy Kubernetes(and Docker, and the drivers needed),
please refer to [NVIDIA webpage](https://docs.nvidia.com/datacenter/kubernetes/kubernetes-upstream/index.html#kubernetes-run-a-workload) for the most up-to-date information.

Below we show the steps we used for this demo to simplify the process, and cover the
nuances you might face in Azure cloud.

## Selecting a VM size on Azure Cloud

In Azure Portal, [http://portal.azure.com/](http://portal.azure.com/) , once you
click `Create a resource` and select `virtual machine`, in one of the screens you will have
opportunity to pick a `VM Size` - that is where you need to make sure you are selecting the
hardware package with GPUs.

It may look something like this:

![Azure Portal](pics/gpu_pick_at_portal.png) 

There is a more flexible option, to use [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/) to deploy a template,
where you can specify the parameters of what you want to provision.

In our case we decided to use N-Series VM size, it is what we put in the parameters.json:

    ...
    "virtualMachineSize": {
        "value": "Standard_NC4as_v4"
    },
    ...

You can deploy this using Azure Portal custom deployment, or via CLI like so(For edetails
see [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/)):

    $ az deployment group create --name blanktemplate --resource-group myvm-gpu-rg --template-file template.json --parameters parameters.json

Once the VM is created, you can check the hardware like so:

    $ lspci
    ...
    1b24:00:00.0 3D controller: NVIDIA Corporation Device 1eb8 (rev a1)
    ...

Here, in our case, we can observe presense of a Tesla T4 card.

## Installing docker

An easy way to install docker is using its provisioning script:

    $ curl https://get.docker.com | sh \
        && sudo systemctl start docker \
        && sudo systemctl enable docker

Let our non-root user(`azureuser`) use it by adding them to the `docker` group:

    $ sudo usermod -aG docker azureuser

## Installing gpu drivers

While you are free to try downloading and installing gpu drivers from the manufacturer,
[Nvidia Driver Downloads](https://www.nvidia.com/Download/index.aspx?lang=en-us),
it is easy to do using packaging:

    $ CUDA_REPO_PKG=cuda-repo-ubuntu1804_10.2.89-1_amd64.deb
    $ wget -O /tmp/${CUDA_REPO_PKG} http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/${CUDA_REPO_PKG} 
    $ sudo dpkg -i /tmp/${CUDA_REPO_PKG}
    $ sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub 
    $ rm -f /tmp/${CUDA_REPO_PKG}
    $ sudo apt-get update
    $ sudo apt-get install cuda-drivers
    Reading package lists... Done
    Building dependency tree
    Reading state information... Done
    cuda-drivers is already the newest version (455.32.00-1).

At this point you should be able to see your card in `nvidia-smi`:

    $ nvidia-smi
    Fri Nov  6 22:11:15 2020
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 455.32.00    Driver Version: 455.32.00    CUDA Version: 11.1     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |                               |                      |               MIG M. |
    |===============================+======================+======================|
    |   0  Tesla T4            On   | 0000697E:00:00.0 Off |                    0 |
    | N/A   78C    P8    13W /  70W |      0MiB / 15109MiB |      0%      Default |
    |                               |                      |                  N/A |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                                  |
    |  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
    |        ID   ID                                                   Usage      |
    |=============================================================================|
    |  No running processes found                                                 |
    +-----------------------------------------------------------------------------+

It is recommended to update the drivers periodically, like so:

    $ sudo apt-get update
    $ sudo apt-get upgrade -y
    $ sudo apt-get dist-upgrade -y
    $ sudo apt-get install cuda-drivers
    $ sudo reboot

And you might want to install cuda sdk:

    $ sudo apt-get install cuda

## Nvidia docker runtime

The gpu workload has to use Nvidia Docker runtime. An easy way to install it on Ubuntu
is via `aptitude`:

    $ distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
       && curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - \
       && curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

    $ sudo apt-get update
    $ sudo apt-get install -y nvidia-docker2

You need to restart the engine:

    $ sudo systemctl restart docker

Now you should be able to see your hardware from withing a container:

    $ sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
    Unable to find image 'nvidia/cuda:11.0-base' locally
    11.0-base: Pulling from nvidia/cuda
    54ee1f796a1e: Pull complete
    f7bfea53ad12: Pull complete
    46d371e02073: Pull complete
    b66c17bbf772: Pull complete
    3642f1a6dfb3: Pull complete
    e5ce55b8b4b9: Pull complete
    155bc0332b0a: Pull complete
    Digest: sha256:774ca3d612de15213102c2dbbba55df44dc5cf9870ca2be6c6e9c627fa63d67a
    Status: Downloaded newer image for nvidia/cuda:11.0-base
    Fri Nov  6 22:31:28 2020
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 455.32.00    Driver Version: 455.32.00    CUDA Version: 11.1     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |                               |                      |               MIG M. |
    |===============================+======================+======================|
    |   0  Tesla T4            On   | 0000697E:00:00.0 Off |                    0 |
    | N/A   40C    P8    10W /  70W |      0MiB / 15109MiB |      0%      Default |
    |                               |                      |                  N/A |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                                  |
    |  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
    |        ID   ID                                                   Usage      |
    |=============================================================================|
    |  No running processes found                                                 |
    +-----------------------------------------------------------------------------+

We also want to make the nvidia runtime be default, so the Kubernetes cluster we
install could use gpu hardware.

Edit `/etc/docker/daemon.json` so it looks something like:

    $ sudo cat /etc/docker/daemon.json
    {
        "default-runtime": "nvidia",
        "runtimes": {
            "nvidia": {
                "path": "nvidia-container-runtime",
                "runtimeArgs": []
            }
        }
    }

Now we are ready to install Kubernetes.

## Microk8s with gpu daemonset

Microk8s is a popular autonomous, production-grade Kubernetes that we will use in a
one-node configuration on our VM.

Installation with Snap is easy:

    $ sudo snap install microk8s --edge --classic
    2020-11-06T23:20:32Z INFO Waiting for automatic snapd restart...
    microk8s (1.19/edge) v1.19.3 from Canonical✓ installed

Idiomatically, let us also made it available to our non-root user:

    $ sudo usermod -a -G microk8s $USER
    $ sudo chown -f -R $USER ~/.kube

Also, add an alias to your .bashrc, to not have to type `microk8s.kubectl` all the time,
and relogin:

    $ su - $USER
    Password:

Now you are ready to start it:

    $ microk8s.start
    Started.

The way Microk8s works, you can enable its components, for example,

    $ microk8s.enable dns storage dashboard

And, more important for us in this deom, gpu:

    $ microk8s.enable gpu
    Enabling NVIDIA GPU
    NVIDIA kernel module detected
    Addon dns is already enabled.
    Applying manifest
    daemonset.apps/nvidia-device-plugin-daemonset created
    NVIDIA is enabled

You can see 'gpu' in your nodes:

    $ microk8s.kubectl get nodes
        NAME          STATUS   ROLES    AGE     VERSION
        gpusandbox    Ready    <none>   8m14s   v1.19.3-34+a56971609ff35a

The node shows gpus, it should look something like this:

    $ microk8s.kubectl describe node gpusandbox
    Capacity:
    ...
    nvidia.com/gpu:     1
    ...
    Allocatable:
    ...
    nvidia.com/gpu:     1
    ...
    Namespace                   Name                                          CPU Requests  CPU Limits  Memory Requests  Memory Limits  AGE
    ---------                   ----                                          ------------  ----------  ---------------  -------------  ---
    ...
    kube-system                 nvidia-device-plugin-daemonset-h5rqp          0 (0%)        0 (0%)      0 (0%)           0 (0%)         3m34s
    ...
    Allocated resources:
    (Total limits may be over 100 percent, i.e., overcommitted.)
    Resource           Requests   Limits
    --------           --------   ------
    ...
    nvidia.com/gpu     0          0
    ...

You can now try deploying gpu-capable workload.

# Links

- http://portal.azure.com
- https://docs.nvidia.com
- https://microk8s.io/
