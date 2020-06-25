# Kubeflow on Azure Stack

This module demonstrates how to create and use a Kubeflow cluster on Azure Stack.

**Table of contents**

- [Overview](#overview)
- [Prerequisites](#prerequisites)
  - [Installing Kubernetes manually](installing_kubernetes.md)
  - [Kubernetes Dashboard](#kubernetes-dashboard)
  - [Persistence on AzureStack](#persistence-on-azure-stack)
- [Install Kubeflow](#install-kubeflow)
- [Kubeflow dashboard](#preparing-kubeflow-dashboard) (preparing and using)
- [Using Kubeflow](#using-kubeflow)
  - [Kubeflow dashboard](#kubeflow-dashboard)
  - [Jupyter Server](#jupyter-server)
  - [TFjob](#TFjob) (distributed training)
  - [PyTorchJob](#PyTorchJob) (distributed training)
- [Uninstalling Kubeflow](#uninstalling-kubeflow)
- [Using Models](#using-models)
- [Next Steps](#next-steps)
- [Links](#links)

## Overview

Main differences of the detached mode include limitations on:

- Scalability. Can't grow beyond of the hardware on premises.
- Handling of the artifacts(e.g. Docker images).
- How to access software packages(especially third-party).
- How storage is allocated and utilized.
- See [Known Issues and Limitations](https://github.com/Azure/aks-engine/blob/master/docs/topics/azure-stack.md#known-issues-and-limitations) for other nuances.

## Prerequisites

The reader is expected to be familiar with the following:

- [Azure](http://azure.com) CLI, and Microsoft Azure subscription covering AKS.
- [Azure Stack Hub](https://azure.microsoft.com/en-us/products/azure-stack/hub/)
- [Kubernetes](https://kubernetes.io/)
- [Kubeflow](https://github.com/kubeflow/kubeflow)
- [Bash](https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart)
- (optional) [Jupyter](https://jupyter.org/).
- (optional) [TensorFlow](https://www.tensorflow.org/)
  - [Tensorboard](https://www.tensorflow.org/tensorboard/)
- (optional) [PyTorch](https://pytorch.org/)


IMPORTANT: While you might have the premissions to retrieve some information on your
own(see [User Information on Azure](acquiring_settings.md)) or create, but most likely
you will need to ask your cloud administrator. You need the following:

  - The link to your Azure Stack Hub Portal (`https://portal.demo2.stackpoc.com/signin/index/@demo.ondemo.com` in this tutorial)

See additional prerequisites if you are [Installing Kubernetes](installing_kubernetes.md) yourself.

## Check the integrity of your Kubernetes cluster

If you already have a Kubernetes cluster you may skip this chapter.

If you do not have a Kubernetes cluster already, follow [Installing Kubernetes](installing_kubernetes.md).

If you did everything correctly, at this point you could ssh to the master node and check
the cluster. You can find master node's public IP address at the Portal(select
subscription `KFDemo2Subscription` and click on the master node):

![pics/kubernetes_cluster.png](pics/kubernetes_cluster.png)

It would be helpful to record the master ip, and a connecting script containing
something like the following: 

    $ ssh -i ~/.ssh/id_rsa_demokey azureuser@12.345.123.45
    Authorized uses only. All activity may be monitored and reported.
    Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-1061-azure x86_64)
    ...

    azureuser@k8s-master-27515788-0:~$ kubectl cluster-info
    Kubernetes master is running at https://kube-rg3-123456.demoe2.cloudapp.example.com
    CoreDNS is running at https://...
    kubernetes-dashboard is running at https://...
    Metrics-server is running at https://...
    To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

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

We provided a script to retrieve a login token:

    $ sbin/get_token.sh
    Name:         namespace-controller-token-masdg
    Type:  kubernetes.io/service-account-token
    token:      12345678904DETcwwkZAyHfzD1Wp8_58eVbzthMmsh1P4ca9mXCB12wEhwS_J0VCsN4ektqjYmoTiXOuc2TGz7XlFys2BBhZLINMH3WYexaHPXovGGtRRg_D8rd_WA-T03SKZwpuPGljb-dYi_NyxqTtwufz7duBRX_1f3Ga4_3f8zEx5wqUCHL4vD2xyaG_EMxhmOpqPBPvlhk3s_dj0_ZGdsLvJZE4cWI1LHGFEuwghc5vPhnJb9QZvsdfgRzbPwUZT4IOsS_tS65Wk

Cut/paste that token into the Sign In screen:

![pics/kubernetes_dashboard_login.png](pics/kubernetes_dashboard_login.png)

You might need to contact your cloud administrator to retrieve the certificates from your cluster, and once
you imported them, you should be able to see the Kubernetes Dashboard in a browser:

![pics/kubernetes_dashboard_intro.png](pics/kubernetes_dashboard_intro.png)

## Persistence on Azure Stack

Most real-life applications need data storage. Azure Stack team actively works on making
available the options available on the public cloud, however, there are nuances in a detauched
environment.

For this demo we will substitute `azurefile` with our own locally-mounted network storage.

Follow the steps in [Installing Storage](installing_storage.md) to create a Persistent Volume Claim
that you could use in your Kubernetes deployments.

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

## Kubeflow dashboard

When you have your istio-ingressgateway's external ip(you can retrieve it using `get_kf_board_ip.sh`),
open it in your browser, and make sure your firewall rules allow HTTP port 80.

![(pics/kubeflow_dashboard1.png](pics/kubeflow_dashboard1.png)

You can monitor Kubeflow cluster by looking at the Kubernetes status, you might need to wait to
let the pods create containers and start.

For more information see [Installing Kubeflow on Azure](https://www.kubeflow.org/docs/azure/deploy/install-kubeflow/)

## Using Kubeflow

You need to create a namespace to be able to create Jupyter servers. 

![pics/kubeflow_dashboard2_notebook_servers.png](pics/kubeflow_dashboard2_notebook_servers.png)

## Jupyter Server

Once you create a server, you can connect to it and upload Python files.

![pics/kubeflow_dashboard3_notebook.png](pics/kubeflow_dashboard3_notebook.png)

You can click the button `Upload`, and upload the provided `demo_notebook.ipynb`, than click
button `Run` to execute, you should see something like this:

![(pics/demo_notebook.png](pics/demo_notebook.png)


## TFjob

[TensorFlow](https://www.tensorflow.org/) is a popular open source machine learning framework.
It was initially developed by the Google Brain team for internal Google use, and later released under
the Apache License 2.0.

See [TensorFlow on Kubeflow Tutorial](tensorflow-on-kubeflow/Readme.md#tensorflow-on-kubeflow-on-azure-stack) for the demo of a `TFJob` execution in the environment that we create in this tutorial.

## PyTorchJob

[PyTorch](https://github.com/pytorch/pytorch) is a popular open source machine learning framework, it has Python and C++ interfaces, primarily developed by Facebook's AI Research Lab. PyTorch is rooted in [Torch library](https://github.com/torch/torch7)

See [PyTorch on Kubeflow Tutorial](pytorch-on-kubeflow/Readme.md#pytorch-on-kubeflow-on-azure-stack) for the demo
of a `PyTorchJob` execution in the environment that we create in this tutorial.

## Uninstalling Kubeflow

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

## Tensorboard

You can skip this chapter for now. There is another useful tool to monitor some ML applications if
they support it. We provided a sample file to start it in your Kubernetes cluster, `tensorboard.yaml`.
You might contact your cloud administrator to help you establish network access, or you can
use ssh port forwarding to see it via your desktop's `localhost` address and port 6006.

Here is how you would connect your Tensorboard with the persistence we discuss next:

    $ cat tb.yaml
    apiVersion: extensions/v1beta1
    kind: Deployment
    metadata:
      labels:
        app: tensorboard
      name: tensorboard
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: tensorboard
      template:
        metadata:
          labels:
            app: tensorboard
        spec:
          volumes:
          - name: samba-share-volume2
            persistentVolumeClaim:
              # claimName: azurefile
              claimName: samba-share-claim
          containers:
          - name: tensorboard
            image: tensorflow/tensorflow:1.10.0
            imagePullPolicy: Always
            command:
             - /usr/local/bin/tensorboard
            args:
            - --logdir
            - /tmp/tensorflow/logs
            volumeMounts:
            - mountPath: /tmp/tensorflow
              #subPath: somedemo55
              name: samba-share-volume2
            ports:
            - containerPort: 6006
              protocol: TCP
          dnsPolicy: ClusterFirst
          restartPolicy: Always

## Using Models

After a model is created and trained, you have many options of how to use it. You can run inferencing directly
in your script after loading the serialized parameters. Here is how it would look like in one of the
demos we cover, if we de-serialize the `model` and get `data` in the correct format:

    output = model(data)
    pred = output.max(1, keepdim=True)[1]
    print(f"data={data}, predicted={pred}")

it will print the input and output for your inferencing.

A better option would be to create a docker container that functions as an api point to get data and return the results.

You can run the container directly like so, for exmple, forwarding it to your machine's port 5050:

     $ docker run -p 5050:8080 mycontaier_with_model:1.0

Now you can use `curl` or write a simple script to run the inferencing(this is from the MLFlow chapter's example):

    import requests

    predicted_qualities = requests.post('http://localhost:5050/invocations', data=test_x.to_json(orient='split'), headers={'content-type':'application/json; format=pandas-split'})
    parsed_predictions = list(map(float, predicted_qualities.text[1:-1].split(',')))
    (rmse, mae, r2) = eval_metrics(test_y, parsed_predictions)

    print("Elasticnet model (alpha=%f, l1_ratio=%f):" % (alpha, l1_ratio))
    print("  RMSE: %s" % rmse)
    print("  MAE: %s" % mae)
    print("  R2: %s" % r2)

Here is an example of the output:

    Elasticnet model (alpha=0.050000, l1_ratio=0.050000):
      RMSE: 82.16359959591213
      MAE: 69.52472687854122
      R2: -0.02072575078015859

A more scalable way would be to run to these instances in Kubernetes deployment, or a Kubeflow's step.

Here is a draft of a suitable pipeline that would be capable of sanitizing and preparing data, wrap
it into a json if needed, and pass to the model in a container:

    apiVersion: argoproj.io/v1alpha1
    kind: Workflow
    metadata:
      generateName: inferencing-demo-
    spec:
      entrypoint: inferencing-example
      templates:
      - name: inferencing-example
        steps:
        - - name: generate-input
            template: whalesay
        - - name: consume-input
            template: run-model
            arguments:
              artifacts:
              # bind message to the intput-art artifact
              # generated by the generate-input step
              - name: message
                from: "{{steps.generate-input.outputs.artifacts.input-art}}"
    
      - name: whalesay
        container:
          image: docker/whalesay:latest
          command: [sh, -c]
          args: ["echo \"{\\\"x\\\":3.0}\" | tee /tmp/input_request.json"]
        outputs:
          artifacts:
          # generate hello-art artifact from /tmp/input_request.json
          # artifacts can be directories as well as files
          - name: input-art
            path: /tmp/input_request.json
    
      - name: run-model
        inputs:
          artifacts:
          # unpack the message input artifact
          # and put it at /tmp/message
          - name: message
            path: /tmp/message
        container:
          image: alpine:latest
          command: [sh, -c]
          args: ["cat /tmp/message"]

Depending on the application, you may want to communicate with the pipeline via requests to the first
step. Or you can compress it all and have your logic inside of the single container.

    apiVersion: argoproj.io/v1alpha1
    kind: Workflow
    metadata:
      generateName: inferencing-demo-curl-
    spec:
      entrypoint: inferencing-example
      templates:
      - name: inferencing-example
        steps:
        - - name: run-inference-server
            template: run-model
    
      - name: run-model
        container:
          image: nginx:alpine
          ports:
          - containerPort: 80

Now you can see the pod with this service(a place-holder for your model) running if you want:

![pics/pipeline_server.png](pics/pipeline_server.png)

It is, in the case above, `inferencing-demo-curl-kj6z5-2763558554`.

Another option is to deploy your model as Kubernetes deployment, here is an nginx server you could try:

    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-nginx
      labels:
        app: my-nginx
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: my-nginx
      template:
        metadata:
          labels:
            app: my-nginx
        spec:
          containers:
          - name: my-nginx
            image: nginx:alpine
            ports:
            - containerPort: 80
            resources:
              limits:
                memory: "128Mi" #128 MB
                cpu: "200m" #200 millicpu (.2 cpu or 20% of the cpu)

Now you can increment number of replicas and your service will be automatically scaled.

This is how you can forward the port for this deployment:

    $ kubectl port-forward deployment/my-nginx 7000:80
    Forwarding from 127.0.0.1:7000 -> 80
    Forwarding from [::1]:7000 -> 80
    Handling connection for 7000

And access your server(model containers) using, for example, `curl`:

    $ curl localhost:7000
    <!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to nginx!</title>    
    ...
    </body>
    </html>

Here is an example of how you can connect to the model you trained:

    $ curl --header "Content-Type: application/json" \
                    --request POST \
                    --data '{"X":123,"Y":568}' \
             http://localhost:5050/api/infere
    Elasticnet model (alpha=0.050000, l1_ratio=0.050000):

    RMSE: 82.16359959591213
    MAE: 69.52472687854122
    R2: -0.02072575078015859

## Next Steps

Proceed to [TensorFlow on Kubeflow Tutorial](tensorflow-on-kubeflow/Readme.md#tensorflow-on-kubeflow-on-azure-stack)
to learn how to execute `TFJob`s on Kubeflow, in the environment that we just created.

And then run [PyTorch on Kubeflow Tutorial](pytorch-on-kubeflow/Readme.md#pytorch-on-kubeflow-on-azure-stack) tutorial to learn running
`PyTorchJob`s.

The PyTorch example we run will log data for TensorBoard, you will see something like this:

![pytorch-on-kubeflow/images/tensorboard_scalars.png](pytorch-on-kubeflow/images/tensorboard_scalars.png)


# Links

The following resources might help during troubleshooting or modifications:

- https://docs.microsoft.com/en-us/azure/cloud-shell/quickstart
- https://docs.microsoft.com/en-us/azure/aks/gpu-cluster
- https://docs.microsoft.com/en-us/azure-stack/asdk/asdk-install
- https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux
- https://docs.microsoft.com/en-us/azure-stack
- https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-cluster
- https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/AKSe-on-AzStackHub
