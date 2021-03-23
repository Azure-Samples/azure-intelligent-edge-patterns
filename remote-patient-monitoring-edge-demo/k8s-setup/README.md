# ACR, Kubernetes and Docker Setup

You only need to take these steps if
    - You are building containers from source _and_
    - You are pushing these containers to a private registry, such as ACR

If neither of those things apply to you, you can skip these steps.

## Steps to authenticate to ACR

The following steps will authenticate your local docker with ACR as well as Kubernetes on the ASE with ACR.

1. Login to your azure portal with this interactive command: `az login`
2. Run `./k8s-setup/setup-auth.sh <your ACR name>`
    - If you are on windows, you can run this in git bash, WSL, or open the file and run each command manually.
    - Example: If your ACR is `contoso.azurecr.io` run `setup-auth.sh contoso`


## Troubleshooting

If you see this error `Error from server (AlreadyExists): secrets "acr-secret" already exists` then you already have a secret of that name.
Either this is a coincidence or this is not the first time running this setup. If you want to use a different secret name run `setup-auth.sh <your namespace name> <different secret name>` You will then need to set this secret name in `values.yaml`