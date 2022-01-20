# Introduction and installation of Kubeflow on Azure Stack

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


Pick the machine from which you will do this lab. It would be convenient location
for keeping the scripts, aliases, keys, setup certificates, keep track of your
configuration files. See our [Recommendations on your development environment](dev_environment.md).

# Pre-requisites

## A Kubernetes cluster

If you do not have a Kubernetes cluster already, follow [Installing Kubernetes](installing_kubernetes.md).

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

You should see the bash shell to a server with `"master"` in its name.

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

---

# Installing Kubeflow

The simpliest way to istall Kubeflow is to use a CNAP package.

**Prerequisite:**
- Will need the k8 cluster ".kubeconfig" file on your local machine to execute commands on the k8 cluster 
- Below instructions are not intended to be run from the master node, but from another Linux dev environment
- Clone the github repo at "/home/user/" path

## Step 1: Install Porter

Make sure you have Porter installed. You can find the installation instructions for your OS at
Porter's [Installation Instructions](https://porter.sh/install/). Latest version on Linux:

    $ curl https://cdn.porter.sh/latest/install-linux.sh | bash    
    Installing porter to /home/azureuser/.porter
    Installed porter v0.29.0 (5e7240cf)
    ...

**NOTE:** be sure to add porter to your `PATH` variable so it can find the binaries

## Step 2: Build Porter CNAB

First you will need to navigate to porter directory in the repository. For example 

    $ git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git
    $ cd azure-intelligent-edge-patterns/Research/kubeflow-on-azure-stack/00-Intro
    $ cd porter/kubeflow
    
Change the file permissions if needed:

    $ chmod 755 kubeflow.sh

Build the porter CNAB like so:

    $ porter build
    Copying porter runtime ===>
    Copying mixins ===>
    Copying mixin exec ===>
    Copying mixin kubernetes ===>
    Generating Dockerfile =======>
    Writing Dockerfile =======>
    Starting Invocation Image Build =======>


## Step 3: Generate Credentials 

This step is needed to connect to your Kubernetes cluster. An easy way to define the connection is to 
point to the kubeconfig file. It is usually either in `/home/azureuser/.kube/config`, or you can find
and copy it from `/etc/kubernetes/admin.conf`. Here is the idiomatic way to do it:

    $ mkdir -p $HOME/.kube
    $ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    $ sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, you could use `KUBECONFIG` environment variable, if you are the root user, you can run:

    $ export KUBECONFIG=/etc/kubernetes/admin.conf

To generate Porter credentials, pick the menu 'from file' and enter your path `/home/azureuser/.kube/config`:

    $ porter credentials generate 
    ? How would you like to set credential "kubeconfig"
    file path
    ? Enter the path that will be used to set credential "kubeconfig"
    /home/azureuser/.kube/config

Validate that your credential is present by running the below command. You should see something like the below output.

    $ porter credentials list
    NAME                MODIFIED
    KubeflowInstaller   40 seconds ago

![List Porter Credentials](porter/kubeflow/pics/porter-credentials-validate.png)

## Step 4: Use Porter CNAB

Run one of the below commands to interact with the CNAB

To Install :

    $ porter install --cred KubeflowInstaller
    installing KubeflowInstaller...
    executing install action from KubeflowInstaller (installation: KubeflowInstaller)
    Install Kubeflow
    Installing Kubeflow
    [INFO] Installing kftctl binary for Kubeflow CLI...
       ... Creating directory to store download
       ... Downloading kfctl binary
    ./kfctl
       ... Creating Kubeflow directory
       ... Installing Kubeflow for deployment: sandboxASkf
    [DEBUG] /root/kubeflow//kfctl apply -V -f https://raw.githubusercontent.com/kubeflow/manifests/v1.1-branch/kfdef/kfctl_k8s_istio.v1.1.0.yaml
    ...
    ...
    execution completed successfully!

The pods will start being created, and it will take several minutes, depending on the performance of your system.

If you watnt to upgrade or uninstall Porter packages, you can use similar commands(do NOT run them right now):
    
    $ porter upgrade --cred KubeflowInstaller
    $ porter uninstall --cred KubeflowInstaller

## Step 5: Check for pods and services

After the installation each of the services gets installed into its own namespace, try below commands to look for pods and services:

    $ kubectl get pods -n kubeflow
    $ kubectl get svc -n kubeflow

Or, use script we provide in `sbin` folder to check until all pods are in `Running` state(press `Ctrl-C` to stop the script
if no pods are in `ContainerCreating`/`Init`/`Error` states anymore):

    $ cd azure-intelligent-edge-patterns/Research/kubeflow-on-azure-stack-lab/sbin
    $ ./check_status.sh
    NAME                                                     READY   STATUS              RESTARTS   AGE
    cache-deployer-deployment-b75f5c5f6-97fsb                0/2     Error               0          6m24s
    cache-server-85bccd99bd-bkvww                            0/2     Init:0/1            0          6m24s
    kfserving-controller-manager-0                           0/2     ContainerCreating   0          6m8s
    metadata-db-695fb6f55-l6dgs                              0/1     ContainerCreating   0          6m23s
    ml-pipeline-persistenceagent-6f99b56974-mnt8l            0/2     PodInitializing     0          6m21s
    Press Ctrl-C to stop...
    NAME                                                     READY   STATUS             RESTARTS   AGE
    cache-server-85bccd99bd-bkvww                            0/2     Init:0/1           0          7m24s
    metadata-grpc-deployment-9fdb476-kszzl                   0/1     CrashLoopBackOff   5          7m22s
    Press Ctrl-C to stop...
    NAME                                                     READY   STATUS             RESTARTS   AGE
    ^C
    

### Step 6: Opening Kubeflow dashboard

To access the dashboard using external connection, replace "type: NodePort" with "type: LoadBalancer" using the patch command:

    $ kubectl patch svc/istio-ingressgateway -p '{"spec":{"type": "LoadBalancer"}}' -n istio-system
    service/istio-ingressgateway patched

Alternatively, you can edit istio-ingressgateway directly like so:

    $ kubectl edit -n istio-system svc/istio-ingressgateway
    service/istio-ingressgateway edited

Then the EXTERNAL-IP will become available from:

    $ kubectl get -w -n istio-system svc/istio-ingressgateway
    NAME                   TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)                          AGE
    istio-ingressgateway   LoadBalancer   10.0.123.210   12.34.56.78   15020:30397/TCP,80:31380/TCP,..  7m27s

When you have your istio-ingressgateway's external ip(you can retrieve it using `get_kf_board_ip.sh`),
open it in your browser, and make sure your firewall rules allow HTTP port 80.

![Kubeflow dashboard](pics/kubeflow_dashboard1.png)

You can monitor Kubeflow cluster by looking at the Kubernetes status, you might need to wait to let the pods create containers and start.

For more information see [Installing Kubeflow on Azure](https://www.kubeflow.org/docs/azure/deploy/install-kubeflow/) 

You can monitor Kubeflow cluster by looking at the Kubernetes status, you might need to wait to
let the pods create containers and start.

---

In case CNAB package installation does not work, you can do it maually, see [Installing Kubeflow manually](installing_kubeflow_manually.md).
You would need to run `kubeflow_install` script we provided, and follow the instructions. At your Kubernetes master node:

    $ git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git
    $ cd azure-intelligent-edge-patterns/Research/kubeflow-on-azure-stack/sbin
    $ chmod 755 *.sh
    $ ./kubeflow_install.sh

We prepared the instructions to [Uninstalling Kubeflow](uninstalling_kubeflow.md) too in case you need to so so.

For more information see [Installing Kubeflow on Azure](https://www.kubeflow.org/docs/azure/deploy/install-kubeflow/)

---

[Back to main page](../Readme.md) | [Next to 01-Jupyter](../01-Jupyter/Readme.md)
