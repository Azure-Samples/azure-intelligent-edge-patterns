# Lab0::Introduction and installation of Kubeflow on Azure Stack

The reader is expected to be familiar with the following:

- [Docker](http://docker.com), see our [Introduction to Docker](introduction_to_docker.md) as a refresher.
- [Azure](http://azure.com) CLI, and Microsoft Azure subscription covering AKS.
- [Azure Stack Hub](https://azure.microsoft.com/en-us/products/azure-stack/hub/)
- [Kubernetes](https://kubernetes.io/)
- [Kubeflow](https://github.com/kubeflow/kubeflow)
- [Bash](https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart)
- [Jupyter](https://jupyter.org/).
- [TensorFlow](https://www.tensorflow.org/)
- [Tensorboard](https://www.tensorflow.org/tensorboard/)
- [PyTorch](https://pytorch.org/)


Pick the machine from which you will do this lab. It would be convenient location for keeping the scripts,
aliases, keys, setup certificates, keep track of your configuration files. For example, you could use:

- laptop with Windows 10,
- a "jump" server on the cloud. If you do not, we will create one in next few modules.

You will need:

- git (to clone this repository, or your own fork of it)
- web browser
  - to access Azure portals
  - to work with dashboards
  - to lookup updated information
- terminal or a vm.

We will be using Microsoft Edge browser, and Ubuntu terminal.

## Ubuntu terminal

Follow these instructions to install Ubuntu on your Windows 10 machine:

[https://ubuntu.com/tutorials/ubuntu-on-windows](https://ubuntu.com/tutorials/ubuntu-on-windows)

Pin the shortcut to your task bar for convenience.

## Validate Ubuntu terminal

Try that Ubuntu termianal works, open the app, type a bash command:

![pics/module01_ubuntu_ternminal.png](pics/module01_ubuntu_ternminal.png)

Alternatives to it would be VirtualBox or WMVare clients. Or, you can always install Ubuntu directly
on your laptop.

# Azure Stack Portal

IMPORTANT: While you might have the premissions to retrieve some information on your
own(see [User Information on Azure](acquiring_settings.md)) or create, but most likely
you will need to ask your cloud administrator. You need the following:

  - The link to your Azure Stack Hub Portal (`https://portal.demo2.stackpoc.com/signin/index/@demo.ondemo.com` in this tutorial)

See additional prerequisites if you are [Installing Kubernetes](installing_kubernetes.md) yourself.

## Azure Stack CLI

In spirit of infrastracture-as-code paradigm, most of things are better run using command like interface of configuration files.

Clone this repository to use the provided scripts and configuration files. You can do it, for example, using comannd line:

    $ git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git

Then go to the `sbin` directory in Kubeflow section (we will give the description of each of the files
later in this section):

    $ cd Research/kubeflow-on-azure-stack/sbin
    $ ls
    check_status.sh
    clean_evicted.sh
    edit_external_access.sh
    get_kf_board_ip.sh
    get_kubernetes_info.sh
    get_token.sh
    inference.yaml
    kubeflow_install.sh
    kubeflow_uninstall.sh
    persistence.yaml
    start_tb.sh
    tensorboard.yaml

# Kubernetes

## Installing Kubernetes

If you do not have a Kubernetes cluster already, follow [Installing Kubernetes](installing_kubernetes.md).

## AKS-e

Validate your aks-e is working. For example, check its version:

    azureuser@jump:~$ aks-engine version
    Version: v0.43.0
    GitCommit: 8928a4094
    GitTreeState: clean

## AKS-e cluster configuration

Follow [AKS-e section](installing_kubernetes.md). To make create the configuration file and apply it to
your Azure Stack infrastructure.

## Post-installation configuration

Make sure you have the right firewall rules and other settings before you start using your cluser.

## Check the integrity of your Kubernetes cluster

**make sure you have the values from [Prerequisites](installing_kubernetes.md#prerequisites) section**.

If you did everything correctly, at this point you could ssh to the master node and check
the cluster. You can find master node's public IP address at the Portal(select
subscription `KFDemo2Subscription` and click on the master node):

![pics/kubernetes_cluster.png](pics/kubernetes_cluster.png)

It would be helpful to record the master ip, and create a one-line script containing
something like the following to connect from your "jump" server: 

    $ ssh -i ~/.ssh/id_rsa_demokey azureuser@12.345.123.45
    Authorized uses only. All activity may be monitored and reported.
    Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-1061-azure x86_64)
    ...

You should see the bash shell to a server with `master` in its name.

## Check that you can see the nodes:

    azureuser@k8s-master-27515788-0:~$ kubectl cluster-info
    Kubernetes master is running at https://kube-rg3-123456.demoe2.cloudapp.example.com
    CoreDNS is running at https://...
    kubernetes-dashboard is running at https://...
    Metrics-server is running at https://...
    To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

## Check that you can see the nodes:

    azureuser@k8s-master-27515788-0:~$ kubectl get nodes
    NAME                       STATUS   ROLES    AGE   VERSION
    k8s-linuxpool-27515788-0   Ready    agent    22m   v1.15.5
    k8s-linuxpool-27515788-1   Ready    agent    22m   v1.15.5
    k8s-linuxpool-27515788-2   Ready    agent    22m   v1.15.5
    k8s-master-27515788-0      Ready    master   22m   v1.15.5

## Kubernetes Dashboard

You are welcome to check if you can see the Kubernetes board from your
machine. You can get your Kubernetes Dashboard's address from `cluster-info`:

    $ kubectl cluster-info
    ...
    kubernetes-dashboard is running at https://kube-rgkf-5.demoe2.cloudapp.stackpoc.com/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy
    ...

You might need to contact your cloud administrator to retrieve the certificates from your cluster, here
is the link with instructions how to do it: [Access the Kubernetes Dashboard in Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-dashboard?view=azs-2002#import-the-certificate).

We provided a script to retrieve a login token(which is a time-sensitive operation, talk to your
cloud administrator to use the imported `kubeconfig` instead):

    $ sbin/get_token.sh
    Name:         namespace-controller-token-masdg
    Type:  kubernetes.io/service-account-token
    token:      12345678904DETcwwkZAyHfzD1Wp8_58eVbzthMmsh1P4ca9mXCB12wEhwS_J0VCsN4ektqjYmoTiXOuc2TGz7XlFys2BBhZLINMH3WYexaHPXovGGtRRg_D8rd_WA-T03SKZwpuPGljb-dYi_NyxqTtwufz7duBRX_1f3Ga4_3f8zEx5wqUCHL4vD2xyaG_EMxhmOpqPBPvlhk3s_dj0_ZGdsLvJZE4cWI1LHGFEuwghc5vPhnJb9QZvsdfgRzbPwUZT4IOsS_tS65Wk

Cut/paste that token into the Sign In screen:

![pics/kubernetes_dashboard_login.png](pics/kubernetes_dashboard_login.png)

Again, you might need to contact your cloud administrator to retrieve the certificates from your cluster
to access these links, you should be able to see the Kubernetes Dashboard in a browser:

![pics/kubernetes_dashboard_intro.png](pics/kubernetes_dashboard_intro.png)

## Docker

See our [Introduction to Docker](introduction_to_docker.md) as a refresher.

You can also check if your machine has cuda gpus, with `nvidia/cuda` image, running nvidia-smi:

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

If it does not, it is also ok.

## DockerHub

In case you do not have it already, you need to create an account at dockerhub.com - it is a simple way for
storing of the docker images for use in our clusters.

Login, and to check that you are connected, run sistem-wide information:

    $ docker login
    ...

    $ docker info
    ...


# Persistence on Azure Stack

Most real-life applications need data storage. Azure Stack team actively works on making
available the options available on the public cloud, however, there are nuances in a detauched
environment.

For this demo we will substitute `azurefile` with our own locally-mounted network storage.

Follow the steps in [Installing Storage](installing_storage.md) to create a Persistent Volume Claim
that you could use in your Kubernetes deployments.

For simplicity, we create a Samba server, but you are welcome to use nfs
version of your choice. You will only update the firewall rules for your
solution, Samba server requires inbound port range `"137-139,445"`

If you done everything right, you should be able to see this `pvc` in your environment:

    $ kubectl get pvc
    NAME                STATUS   VOLUME               CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    ...
    samba-share-claim   Bound    samba-share-volume   20Gi       RWX            local-storage   23h
    ...

And you should see the Persisted Volume itself:

    $ kubeclt get pv
    NAME               CAPACITY ACCESS MODES   RECLAIM POLICY STATUS CLAIM                       STORAGECLASS    REASON   AGE
    ...
    samba-share-volume 20Gi     RWX            Retain         Bound  default/samba-share-claim   local-storage            23h
    ...

Consult your cloud system administrator if you have any problems, there could be many other
options sutable to particular scenarios and development lifecycle.

# Kubeflow

## Install Kubeflow

The easiest way to install Kubeflow on Azure Stack is to run script `kubeflow_install.sh` from
`sbin` directory. There are other useful scripts, all of which you should be running at
the master node of your Kubernetes cluster:

- kubeflow_install.sh - installs Kubeflow.
- kubeflow_uninstall.sh - uninstalls Kubeflow.
- edit_external_access.sh - runs command to open Kubernetes editor.
- get_kf_board_ip.sh - helps find out the IP address of the Kubeflow dashboard.
- get_kubernetes_info.sh - your Kubernetes infrastructure information.
- get_token.sh - simplifies obtaining a token.
- clean_evicted.sh - kills evicted pods, hopefully you will not need to run this one.
- check_status.sh - to see useful information during installation/uninstallation.

At your Kubernetes master node:

    $ git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git
    $ cd azure-intelligent-edge-patterns/Research/kubeflow-on-azure-stack/sbin

**IMPORTANT:**

**Do NOT stop the script until it finishes. Some Kubernetes errors and warnings are expected
until the system fully functional. After the installer finishes, it takes several minutes
for the containers to create. Kubeflow cluster name, config, and path to kfctl will be
apended to `~/.bashrc` for the `kubeflow_uninstall.sh` to work. You will need to re-login
or run `". ~/.bashrc"` to set the environment variables.**

Run the script:

    $ ./kubeflow_install.sh
    Installing Kubeflow
    Writing logs to "~/kubeflow/install.log"
    ...
    ...
    <a very long process(several minutes), with Kubernetes warnings and errors about the not-yet-created pods>
    ...
    ...
    INFO[0134] Successfully applied application seldon-core-operator  filename="kustomize/kustomize.go:209"
    INFO[0134] Applied the configuration Successfully!       filename="cmd/apply.go:72"
    The installation will take a while, and there will be some time needed to create the pods.
    In a few minutes, check the resources deployed correctly in namespace 'kubeflow'
    kubectl get all -n kubeflow


As we mentioned, if you have done everything correctly, the log will be long and, because
of the nature of Kubernetes, some time is needed for the system to become functional. Even when 
the script ends, you will see something like this, indicating the pods are being created:

![pics/progress_container_creating.png](pics/progress_container_creating.png)

For your particular environment, you can modify the definitions in the script, or
pass the parameters in the command line(they overwrite the defaults): 

    --kf_ctl_dir <dir_name>      - where to download and install kfctl
    --kf_name <name>             - name of the Kubeflow cluster
    --kf_username <username>     - user name under which to install Kubeflow
    --kfctl_release_uri <uri>    - kfctl URI
    --kf_dir_base <dir_name>     - the base dir for instances of Kubeflow
    --kf_config_uri <uri>        - config URI of Kubeflow config
    --help              - show help

Feel free to use script `check_status.sh` to monitor the Kubeflow cluster coming up, it
should show you the pods that are being created or terminated. As cluster being created, all pods will
become `Running` and the list will be empty:

    $ ./check_status.sh
    NAMESPACE         NAME                                                           READY   STATUS              RESTARTS   AGE
    istio-system      istio-pilot-677df6b6d4-266mg                                   0/2     ContainerCreating   0          2s
    istio-system      istio-pilot-677df6b6d4-prpzq                                   0/2     Pending             0          2s
    kubeflow          katib-db-manager-54b66f9f9d-7wqms                              0/1     Error               0          71s
    kubeflow          katib-mysql-dcf7dcbd5-tnb7g                                    0/1     ContainerCreating   0          70s
    kubeflow          metadata-db-65fb5b695d-vncwd                                   0/1     ContainerCreating   0          80s
    kubeflow          metadata-grpc-deployment-5c6db9749-jx2tl                       0/1     CrashLoopBackOff    3          80s
    kubeflow          minio-6b67f98977-kltck                                         0/1     ContainerCreating   0          69s
    kubeflow          mysql-85bc64f5c4-9jpfh                                         0/1     ContainerCreating   0          69s
    Press Ctrl-C to stop...
    ^C

When the pods have been created, you can proceed.

To start using Kubeflow, you may want to make Kubeflow Dashboard be visible, so you will need
to change the type of the ingress behavior - from `NodePort` to `LoadBalancer`, using this
command (default editor is vi, to edit you need to press `i`, and to save and exit, `<esc>:wq`):

    $ ./edit_external_access.sh

Or you can patch it like so:

    $ kubectl patch svc/istio-ingressgateway -p '{"spec":{"type": "LoadBalancer"}}' -n istio-system
    service/istio-ingressgateway patched

It will look something like this: 

![pics/ingress_loadbalancer.png](pics/ingress_loadbalancer.png)

You can run another script from the sbin directory, `get_kf_board_ip.sh` to get the external
IP when it is ready:

    $ ./get_kf_board_ip.sh
    kubectl get -w -n istio-system svc/istio-ingressgateway
    NAME                   TYPE           CLUSTER-IP   EXTERNAL-IP   PORT          
    istio-ingressgateway   LoadBalancer   10.0.7.257   <pending>     15020:32053/TCP,80:31380/TCP...
    istio-ingressgateway   LoadBalancer   10.0.7.257   88.258.18.69  15020:32053/TCP,80:31380...

So, when it is no longer `<pending>`, it(from the above output, `88.258.18.69`) should be accessible from your browser.

Congratulations, you can now skip to the chapter "Using Dashboard".

### If you choose to do the installation manually. 

The following is done at the master node. If you plan to install Kubeflow clusters often, consider
creating a script with all the commands.

Download the `kfctl` from [Kubeflow releases](https://github.com/kubeflow/kfctl/releases) page.

    $ mkdir kubeflow
    $ cd kubeflow/
    $ wget https://github.com/kubeflow/kfctl/releases/download/v1.0.2/kfctl_v1.0.2-0-ga476281_linux.tar.gz
    ...
    ‘kfctl_v1.0.1-0-gf3edb9b_linux.tar.gz’ saved [31630869/31630869]

    $ tar -xvf kfctl_v1.0.1-0-gf3edb9b_linux.tar.gz

    $ export PATH=$PATH:~/kubeflow/
    $ export KF_NAME=sandboxASkf
    $ export BASE_DIR=/opt/
    $ export KF_DIR=${BASE_DIR}/${KF_NAME}
    $ export CONFIG_URI="https://raw.githubusercontent.com/kubeflow/manifests/v1.0-branch/kfdef/kfctl_k8s_istio.v1.0.2.yaml"
    
Generate and deploy Kubeflow:

    $ sudo mkdir -p ${KF_DIR}
    $ sudo chown azureuser ${KF_DIR}
    $ cd ${KF_DIR}

**IMPORTANT:**

**Do NOT stop this command until it finishes. Some Kubernetes errors and warnings are expected
until the system fully functional. It takes several minutes for the containers to create.**

    $ kfctl apply -V -f ${CONFIG_URI}
    ...
    ...
    <a very long process(several minutes), with Kubernetes warnings and errors about the not-yet-created pods>
    ...
    ...
    INFO[0184] Successfully applied application seldon-core-operator  filename="kustomize/kustomize.go:209"
    INFO[0184] Applied the configuration Successfully!       filename="cmd/apply.go:72"

Check the resources deployed correctly in namespace `kubeflow`. It will take several minutes
for the pods to come up:
  
    $ kubectl get all -n kubeflow

It will show the list of the services and pods for the cluster we just created.

## Installation using Porter (CNAP packages)

Installing via Porter packaging manager (CNAP packages) is easy. See [Installing CNAP](install_porter/Readme.md).

# Kubeflow Dashboard

## Preparing Kubeflow dashboard

Make sure all the pods are up and running(Using `kubectl get all -n kubeflow`, wait until
they are).

To access the dashboard using external connection, replace `"type: NodePort"` with
`"type: LoadBalancer"` using the editor (default editor is vi, to edit you need
to press `i`, and to save and exit, `<esc>:wq`):

    $ kubectl edit -n istio-system svc/istio-ingressgateway
    service/istio-ingressgateway edited

Then the EXTERNAL-IP will become available from:

    $ kubectl get -w -n istio-system svc/istio-ingressgateway
    NAME                   TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)                          AGE
    istio-ingressgateway   LoadBalancer   10.0.123.210   12.34.56.78   15020:30397/TCP,80:31380/TCP,..  7m27s

## Example Kubeflow dashboard

When you have your istio-ingressgateway's external ip(you can retrieve it using `get_kf_board_ip.sh`),
open it in your browser, and make sure your firewall rules allow HTTP port 80.

![(pics/kubeflow_dashboard1.png](pics/kubeflow_dashboard1.png)

You can monitor Kubeflow cluster by looking at the Kubernetes status, you might need to wait to
let the pods create containers and start.

For more information see [Installing Kubeflow on Azure](https://www.kubeflow.org/docs/azure/deploy/install-kubeflow/)

## GPU

You can verify the system with nvidia/cuda image, running nvidia-smi:

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

There are certain changes you would need to make to your configuration and scripts to
be able to utilize gpus and other hardware acceleration tools. Deeper discussion is
beyond the scope of this lab.

# Uninstalling Kubeflow

If you installed Kubeflow using `kubeflow_install.sh`, you can remove it using `kubeflow_uninstall.sh`:

    $ ./kubeflow_uninstall.sh
    Removing Kubeflow from /opt/sandboxASkf, according to kfctl_k8s_istio.v1.0.2.yaml

It runs `kfctl delete` on the same .yaml that was used to create the cluster. If you are not
using `kubeflow_unistall.sh` script, you would need to do it manually(`kfctl delete -f <the sript's name>`).

To see Kubeflow's pods disappear, run `check_status.sh` script:

    $ ./check_status.sh
    NAMESPACE         NAME                                            READY   STATUS        RESTARTS   AGE
    kubeflow          argo-ui-7ffb9b6577-n295r                        0/1     Terminating   0          31m
    kubeflow          jupyter-web-app-deployment-679d5f5dc4-2cvwt     0/1     Terminating   0          31m
    kubeflow          metadata-grpc-deployment-5c6db9749-jx2tl        0/1     Terminating   5          31m
    kubeflow          metadata-ui-7c85545947-55smm                    0/1     Terminating   0          31m
    Press Ctrl-C to stop...
    NAMESPACE         NAME                                            READY   STATUS        RESTARTS   AGE
    kubeflow          metadata-grpc-deployment-5c6db9749-jx2tl        0/1     Terminating   5          31m
    kubeflow          metadata-ui-7c85545947-55smm                    0/1     Terminating   0          31m
    Press Ctrl-C to stop...
    NAMESPACE         NAME                                            READY   STATUS      RESTARTS   AGE
    Press Ctrl-C to stop...
    NAMESPACE         NAME                                            READY   STATUS      RESTARTS   AGE
    ^C

One last thing is left - to remove the Kubeflow folder. The `kubeflow_uninistall.sh` script gives you
the exact command you need to run according to your configuration, if you left default settings,
it will look like so:

    $ sudo rm -rf /opt/sandboxASkf

You can now re-install it if you would like.

---

[Back to main page](../Readme.md) | [Next to Lab::01](../01-Jupyter/Readme.md)
