# Installing aks-engine

Download `aks-engone` installation script if you do not have it already:

    $ curl -o get-akse.sh https://raw.githubusercontent.com/Azure/aks-engine/master/scripts/get-akse.sh
    $ chmod 700 get-akse.sh

Run the installer, specifying its version:

    $ ./get-akse.sh --version v0.43.0

If you have problems, please refer to the official page: [Install the AKS engine on Linux in Azure Stack](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux).

In the completely disconnected environment, you need to acquire the archive via a machine that does have the connection, and uncompress it on the machine where you plan using it:

    $ tar xvzf aks-engine-v0.xx.x-linux-amd64.tar.gz -C /usr/local/bin

Verify `aks-engine` version:

    $ aks-engine version
    Version: v0.43.0
    GitCommit: 8928a4094
    GitTreeState: clean

# Links

- [Azure/aks-engine](https://github.com/Azure/aks-engine)
- [Types of volumes on Kubernetes](https://kubernetes.io/docs/concepts/storage/#types-of-volumes)
- [Install the AKS engine on Linux in Azure Stack](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-kubernetes-aks-engine-deploy-linux)


[Back](Readme.md)
