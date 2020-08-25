# Installing Kubeflow as Porter Bundle

This Readme file demonstrates how to build and use [Porter](https://porter.sh) bundle that
downloads Kubeflow and installs in in your Kubernetes cluster.

# Pre-requisites

1. Porter:

If you do not have Portal on your system, here is how you install it on Linux:

    $ curl https://cdn.porter.sh/latest/install-linux.sh | bash

On Windows:

    C:> iwr "https://cdn.porter.sh/latest/install-windows.ps1"

On Mac:

    $ curl https://cdn.porter.sh/latest/install-mac.sh | bash 

Verify it works:

    $ porter version
    porter v0.26.3-beta.1 (c0dc3415)

See [Get Started](https://porter.sh/install/) if you have any questions.

2. Kubernetes

Verify you have Kubernetes installed, and you are on the master node of your cluster:

    $ kubectl version
    v1.15.5

3. Docker

Verify you have Docker installed and can login to your image repository.

    $ docker --version
    Docker version 3.0.11

You might want to add your user to the docker group to not have to `sudo` it:

    $ sudo usermod -aG docker $USER

For building the install image you need to have a Docker account:

    $ docker login
    Login Succeeded

# Building bundle

To build Porter bundle, run:

    $ porter build
    Copying porter runtime ===>
    Copying mixins ===>
    Copying mixin exec ===>
    Generating Dockerfile =======>
    Writing Dockerfile =======>
    Starting Invocation Image Build =======>

# Publishing

To Publish this bundle to your repository:

    $ docker login
    Login succeeded

    $ porter publish
    Building bundle ===>
    Copying porter runtime ===>
    Copying mixins ===>
    Copying mixin exec ===>
    Generating Dockerfile =======>
    Writing Dockerfile =======>
    Starting Invocation Image Build =======>
    Pushing CNAB invocation image...
    The push refers to repository [docker.io/azureuser/porter-kubeflow-installer]
    0931d645fe56: Preparing
    b4cfff1db98c: Preparing
    8354d5896557: Preparing
    8354d5896557: Mounted from library/debian
    b4cfff1db98c: Pushed
    67dec4fa9347: Pushed
    0931d645fe56: Pushed

# Installing the bundle 

The simple local case for installing(uninstalling) your bundle looks like so:

    $ porter install
    installing KubeflowInstaller...
    executing install action from KubeflowInstaller (bundle instance: KubeflowInstaller)
    ...
    execution completed successfully!

To fetch your bundle from another computer, you need to specify the repository and version as the tag:

```
$ porter install demo --tag azureuser/porter-kubeflow-installer:v0.1.0
installing demo...
Unable to find image 'azureuser/porter-kubeflow-installer@sha256:d5bfe588446e7eea6d3af2793e59d4228f09a18c63b8b49c31' locally
sha256:d5bfe588446e7eea6d3af2793e59d4228f09a18c63b8b49c3: Pulling from azureuser/porter-kubeflow-installer:v0.1.0
81fc19181915: Pulling fs layer
b00ab717ffe7: Pulling fs layer
b00ab717ffe7: Waiting
7ee7170ddbe5: Waiting
81fc19181915: Download complete
0f27bf3ff1d9: Verifying Checksum
70542042554c: Download complete
b00ab717ffe7: Verifying Checksum
b00ab717ffe7: Download complete
70542042554c: Pull complete
7ee7170ddbe5: Pull complete
b00ab717ffe7: Pull complete
Digest: sha256:d5bfe588446e7eea6d3af2793e59d4228f09a18c63b8b49c3158e65
Status: Downloaded newer image for azureuser/porter-kubeflow-installer@sha256:d5bfe588446e7eea6d3af2793e59d4228f09a18c63b8b49c3158
executing install action from KubeflowInstaller (bundle instance: demo)
...
execution completed successfully!
```

# Links

- [Porter](https://porter.sh)
