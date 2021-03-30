# Build Docker Images from Source and Push to ACR (Optional)

The recommended method is to deploy the [containers that are available on Docker Hub](./README.md#prebuilt-images-in-docker-hub). This is the default behavior when you run the deployment process. However, if you want to build the docker images from source and deploy to ACR, the steps below will show you how to do that. 

_You only need to take these steps if you are building containers from source and you are pushing these containers to a private registry, such as ACR._
  
A Docker Compose file is included to make it easier to build from source and push to your private registry. A configuration for Azure Container Registry (ACR) is included by default.

If you would like to push to another private registry, you will need to handle that authentication yourself.

## 1. Set Your Docker Registry Address Variable

You need to set your registry address variable to `$docker_registry` for use in the subsequent steps.

- Check if your registry address is present. If this is set and correct, then proceed to step 2.

    `echo $docker_registry`

- If you completed the automated setup for Azure Services than a file containing your Docker Registry Address was generated. You can load by running:  

    `source ./azure-cloud-services/outputs` 

- If you set up Azure Services manually, or if you are using a different registry you need to set this variable.

    `export docker_registry='<your registry URL>/'`   

_Note: The registry name here should be the full URL wrapped in **single quotes** with a **trailing slash**. For example: If your ACR is `contoso`, use `'contoso.azurecr.io/'`._

## 2. ACR, Kubernetes and Docker Authentication

The following steps will authenticate your local docker with ACR as well as Kubernetes on the ASE with ACR.

1. Login to your azure portal with this interactive command:  
   `az login`  
2. Navigate to top level project directory in your shell terminal.
3. Run: `./azure-cloud-services/setup-auth.sh $docker_registry`

_Note: If you are on windows, you can run this in git bash, WSL, or open the file and run each command manually._

## 3. Build and Push Docker Images

1. Build your images  
  `docker-compose build`

   _Note: This can take 10 minutes are so to complete._
2. Push your images (You must be authenticated to your registry)    
  `docker-compose push`

   _Note: Depending on your upload speeds, this can take some time._

## Common Issues and Troubleshooting

This error indicates you already have a secret of that name:

`Error from server (AlreadyExists): secrets "acr-secret" already exists` 

This is either coincidental or this is not the first time this setup was run. 

### Remove this Secret
To remove this secret, run `kubectl delete secrets acr-secret`

### Use a Different Secret Name
If you want to use a different secret name:
1. run `setup-auth.sh <your namespace name> <different secret name>`. 
2. Set this secret name in `values.yaml`.