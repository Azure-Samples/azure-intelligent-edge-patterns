# Uninstalling Kubeflow

If you installed Kubeflow using `kubeflow_install.sh`, you can remove it using `kubeflow_uninstall.sh`:

    $ ./kubeflow_uninstall.sh
    Removing Kubeflow from /opt/sandboxASkf, according to kfctl_k8s_istio.v1.1.0.yaml

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

[Back](Readme.md)
