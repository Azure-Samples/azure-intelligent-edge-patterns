# Introduction to Docker

## Prerequisites

- [Docker](http://Docker.com) on your machine.
- [DockerHub](http://DockerHub.com) account.

## Docker with GPU

A special version is needed for a docker to use GPU hardware. See [nvidia-docker](https://github.com/NVIDIA/nvidia-docker) for more information.

Folder `docker` has a GPU-using Tensorflow example Dockerfile. To test if your VM is can run GPU containers.

Build a simple local image:

    $ cd Research/kubeflow-on-azure-stack/docker
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

## DockerHub

In case you do not have it already, you need to create an account at dockerhub.com - it is a simple way for
storing of the docker images for use in our clusters.

Login, and to check that you are connected, run sistem-wide information:

    $ docker login
    ...

    $ docker info
    ...

## Deploying this container to Kubernetes

To deploy this container to your Kubernetes cluster, you need to create a .yaml. 
Here is an example we provide in folder `docker/`:

```
apiVersion: batch/v1
kind: Job
metadata:
  labels:
    app: samples-tf-mnist-demo
  name: samples-tf-mnist-demo
spec:
  template:
    metadata:
      labels:
        app: samples-tf-mnist-demo
    spec:
      containers:
      - name: samples-tf-mnist-demo
        image: rollingstone/samples-tf-mnist-demo:gpu
        args: ["--max_steps", "500"]
        imagePullPolicy: IfNotPresent
        resources:
          limits:
      # uncomment if you do have a gpu      
      #     nvidia.com/gpu: 1
      restartPolicy: OnFailure
```    

Once you create your docker image and push it to your DockerHub(or any other container
storage you have available), in the .yaml above replace `rollingstone` with your own account name
and run like so:

    $ kubectl create -f simple_tf_mnist.yaml

See docker.com or kubernetes.com for more details, and contact your cloud admninistrator if you
have any questions.

## Links

- https://github.com/Azure/kubeflow-labs
- https://docker.com
- https://kubernetes.com

---

[Back](Readme.md)
