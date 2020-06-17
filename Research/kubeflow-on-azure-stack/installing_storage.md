# Installing Storage

If you would like to save the results of model training, you can do so from your scripts,
defining Kubernetes volumes for your containers. However, on Azure Stack you do not have `azurefile`
available yet. Luckily, there are many other options, e.g. you can use a network storage.

## Creating smb server

Follow the [Installing Samba Server](installing_smb_server.md) to create your network storage server.
It could also be a good idea to ask your Azure Stack administrator to create it for you, or switch
to other available options on the cluster you are using.


## Creating smb clients

On the client side, if you have to do it yourself, install a Samba client:

    $ sudo apt install -y smbclient cifs-utils

Create a folder for mounting:

    $ sudo mkdir /mnt/shares
    $ sudo chown azureuser:azureuser /mnt/shares

Put your share drive information to `/etc/samba`:

    $ sudo vi /etc/samba/.sambacreds
    $ cat /etc/samba/.sambacreds
    username=sambauser1
    password=<the password>
    domain=WORKGROUP

Define the mount in your `fstab` file, pointing to your .sbmabcreds file and the mounting point we created:

    $ sudo vi /etc/fstab
    $ cat /etc/fstab
    ...
    //12.34.259.89/sambauser1        /mnt/shares     cifs    rw,uid=azureuser,guest,noperm,credentials=/etc/samba/.sambacreds        0 0
    ...

    $ sudo mount /mnt/shares

Verify the mounting, you should see your server's ip and Samba user:

    $ sudo mount
    ...
    //12.34.259.89/sambauser1 on /mnt/shares type cifs (rw,relatime,vers=default,cache=strict,username=sambauser1,domain=WORKGROUP,uid=1000,forceuid,gid=0,noforcegid,addr=12.34.259.89,file_mode=0755,dir_mode=0755,soft,nounix,serverino,mapposix,noperm,rsize=1048576,wsize=1048576,echo_interval=60,actimeo=1)
    ...

Try the following from two different nodes of your cluster. On one:

    $ echo "from machine a" >  /mnt/shares/from_machine_a.txt
    
On the other:    

    $ ls /mnt/shares/
    from_machine_a.txt
    $ cat /mnt/shares/from_machine_a.txt
    from machine a

You would need to repeat the same installation process on all Kubernetes nodes, because
the pods could be instantiated anywhere and will try to access the local storage there.

## Creating storage class, pv, and pvc

Create a .yaml with sc/pv/pvc definitions pointing to the created shared folder,
similar to the provided `sbin/persistence.yaml`:

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
#reclaimPolicy: Retain
#volumeBindingMode: WaitForFirstConsumer
---
kind: PersistentVolume
apiVersion: v1
metadata:
  name: samba-share-volume
  labels:
    type: local
    app: tfjob
spec:
  storageClassName: local-storage
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteMany
  hostPath:
    path: "/mnt/shares/kfbuffer"
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: samba-share-claim
spec:
  storageClassName: local-storage
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

Apply it:

    $ kubectl create -f persistence.yaml
    storageclass.storage.k8s.io/local-storage created
    persistentvolume/samba-share-volume created
    persistentvolumeclaim/samba-share-claim created

    $ kubectl get pvc
    NAME                STATUS   VOLUME               CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    samba-share-claim   Bound    samba-share-volume   20Gi       RWX            local-storage   2m24s

    $ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                   STORAGECLASS    REASON   AGE
    ...
    samba-share-volume                         20Gi       RWX            Retain           Bound    default/samba-share-claim               local-storage            2m41s
    ...

You should see the pv being `Bound`, and it is available for your applications.

    $ kubectl describe pvc samba-share-claim
    Name:          samba-share-claim
    Namespace:     default
    StorageClass:  local-storage
    Status:        Bound
    Volume:        samba-share-volume
    Labels:        <none>
    Annotations:   pv.kubernetes.io/bind-completed: yes
                   pv.kubernetes.io/bound-by-controller: yes
    Finalizers:    [kubernetes.io/pvc-protection]
    Capacity:      20Gi
    Access Modes:  RWX
    VolumeMode:    Filesystem
    Mounted By:    dist-mnist-for-e2e-test-demo-ps-0
                   dist-mnist-for-e2e-test-demo-worker-0
                   dist-mnist-for-e2e-test-demo-worker-1
                   dist-mnist-for-e2e-test-demo-worker-2
    Events:        <none>

And the volume itself marked as `HostPath`:

    $ kubectl describe pv samba-share-volume
    Name:            samba-share-volume
    Labels:          type=local
    Annotations:     pv.kubernetes.io/bound-by-controller: yes
    Finalizers:      [kubernetes.io/pv-protection]
    StorageClass:    local-storage
    Status:          Bound
    Claim:           default/samba-share-claim
    Reclaim Policy:  Retain
    Access Modes:    RWX
    VolumeMode:      Filesystem
    Capacity:        20Gi
    Node Affinity:   <none>
    Message:
    Source:
        Type:          HostPath (bare host directory volume)
        Path:          /mnt/shares/kfbuffer
        HostPathType:
    Events:            <none>

## Example of attaching

So, now you can attach this volume to, for example, a `TFJob`, available in the
subfolder [tensorflow-on-kubeflow](tensorflow-on-kubeflow/Readme.md), like this:

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
                image: kubeflow/tf-dist-mnist-test:1.0
                volumeMounts:
                - mountPath: "/tmp/mnist-data"
                  name: samba-share-volume2
              volumes:
              - name: samba-share-volume2
                persistentVolumeClaim:
                  claimName: samba-share-claim
        Worker:
          replicas: 3
          restartPolicy: OnFailure
          template:
            spec:
              containers:
              - name: tensorflow
                image: kubeflow/tf-dist-mnist-test:1.0
                volumeMounts:
                - mountPath: "/tmp/mnist-data"
                  name: samba-share-volume2
              volumes:
              - name: samba-share-volume2
                persistentVolumeClaim:
                  claimName: samba-share-claim

And you can see the checkpoints and data from your model training in the folder where you
mounted your Samba network volume:

    $ ls /mnt/shares/kfbuffer/
    checkpoint                                                             model.ckpt-0.meta
    events.out.tfevents.1592351909.dist-mnist-for-e2e-test-demo2-worker-0  t10k-images-idx3-ubyte.gz
    graph.pbtxt                                                            t10k-labels-idx1-ubyte.gz
    model.ckpt-0.data-00000-of-00001                                       train-images-idx3-ubyte.gz
    model.ckpt-0.index                                                     train-labels-idx1-ubyte.gz

[Back](Readme.md)
