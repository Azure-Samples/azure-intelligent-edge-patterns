# Kubeflow on Azure

A set of exercises and demos of using Kubeflow on Azure:

- Docker with GPU
  - local container, building/publishing
  - running GPU-enabled containers on Azure
- Kubernetes cluster on Azure
  - provisioning using Azure CLI
  - running workloads
  - monitoring
- Kubeflow on Azure
  - ...wip...

## Prerequisites

Some of the pre-requisites may be skipped, it depends on the scope of the exercises.

- [Azure](http://azure.com) CLI, and Microsoft Azure subscription covering AKS.
- git, and [GitHub](http://github.com) account.
- [Docker](http://docker.com), DockerHub account.
- Helm.
- [Jupyter](https://jupyter.org/).
- [ksonnet](https://github.com/ksonnet/ksonnet).
- [Kubeflow](https://github.com/kubeflow/kubeflow)
- Visual Code
- [Bash in Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart)

## Docker with GPU

A special version is needed for a docker to use GPU hardware. See [nvidia-docker](https://github.com/NVIDIA/nvidia-docker) for more information.

Folder `docker` has a GPU-using Tensorflow example Dockerfile. To test if your VM is can run GPU containers.

Build a simple local image:

    $ cd kubeflow-on-azure/docker
    $ sudo docker build -t mytest:gpu .

To run the image we built: 

    $ sudo nvidia_docker run mytest:gpu

You can also verify the system with `nvidia/cuda` image, running `nvidia-smi`:

    $ sudo docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi
    
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 440.33.01    Driver Version: 440.33.01    CUDA Version: 10.2     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla K80           On   | 0000828D:00:00.0 Off |                  Off |
    | N/A   35C    P8    37W / 149W |      0MiB / 12206MiB |      0%      Default |
    +-------------------------------+----------------------+----------------------+
    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |  No running processes found                                                 |
    +-----------------------------------------------------------------------------+

You can create a virtual machine using [Azure Portal](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal), and replicate the steps described above if you select the image from N-Series, that provides GPU support.

## Kubernetes cluster on Azure

You can create a new resource group using Azure CLI:

    $ az group create --name sandboxRG --location westus2

This is how you can create a one-node cluster using `aks` command:

    $ az aks create --resouce-group sandboxRG --name sandboxAKS \
      --node-vm-size Standard_NC6 --node-count 1

Now you can run workloads on this cluster. For example, a .yaml from this repository. It refers to the similar image we created earlier,
you can replace `microsoft/samples-tf-mnist-demo:gpu` with your own. the `kubectl` command looks like this:

    $ kubectl apply -f kubeflow-on-azure/kubernetes/sample-tf-mnist.yaml

Now you can see the pods and jobs running. For example:

    $ kubectl get jobs samples-tf-mnist-demo --watch
    ..................

    $ kubectl get posd --selector app=samples-tf-mnist-demo
    ..................

For more details, see [Use GPUs for compute-intensive workloads on Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/gpu-cluster)

## Kubeflow




TODO 





## Next Steps

The following resources might help during troubleshooting or modifications:

- https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart
- https://docs.microsoft.com/en-us/azure/aks/gpu-cluster
- https://docs.microsoft.com/en-us/azure-stack/asdk/asdk-install
- https://docs.microsoft.com/en-us/azure-stack


