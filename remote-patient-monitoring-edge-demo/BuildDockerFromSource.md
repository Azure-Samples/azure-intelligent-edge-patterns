# Build Docker Images from Source and Push to ACR (Optional)

The recommended method is to deploy the [containers that are available on Docker Hub](./README.d#prebuilt-images-in-docker-hub). This the default behavior when you run the deployment process. However, if you want to build the docker images from source and deploy to ACR, the steps below will show you how to do that. 

You only need to take these steps if:
    - You are building containers from source _and_
    - You are pushing these containers to a private registry, such as ACR
  
A Docker Compose file is included to make it easier to build from source and push to your private registry. A configuration for Azure Container Registry (ACR) is included by default.

If you would like to push to another private registry, you will need to handle that authentication yourself.

## 1. Set Your Docker Registry Address Variable

Set your registry address variable `$docker_registry` for use in the subsequent steps
    
    - Check if it is present `echo $docker_registry`
    - If you completed the automated setup for Azure Services than this file was generated. You can load by running:  
    `source ./azure-cloud-services/outputs`  
   - If using some other registry, or if you set up Azure Services manually:
   `export docker_registry='<your registry name>/'`   
       - The registry name here should be the full URL wrapped in single quotes with a trailing slash. For example, if your ACR is `contoso`, use `'contoso.azurecr.io/'` here.   

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
   - This can take 10 minutes are so to complete  
2. Push your images (You must be authenticated to your registry)    
  `docker-compose push`  
   _Note: Depending on your upload speeds, this can take some time_

## Common Issues and Troubleshooting

- If you see this error `Error from server (AlreadyExists): secrets "acr-secret" already exists` then you already have a secret of that name. 

This is either coincidental or this is not the first time this setup was run. 

To remove this secret run `kubectl delete secrets acr-secret`

Or, if you want to use a different secret name:
1. run `setup-auth.sh <your namespace name> <different secret name>`. 
2. Set this secret name in `values.yaml`.