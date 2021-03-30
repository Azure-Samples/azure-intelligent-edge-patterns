# Azure Cloud Services

This repo contains the configuration for the Azure Cloud Services needed to use this software.

# Prerequisites

- An Azure Account
- A user account with Owner/Contributor permissions to subscription
- A shell (either bash or Powershell)
- [az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Optional: [Bicep CLI](https://github.com/Azure/bicep/blob/main/docs/installing.md)
- Optional: Docker

# Setup Steps

Before proceeding, complete your authentication to Azure in your browser first. Navigate to [portal.azure.com](https://portal.azure.com), and sign in. These commands should be run from a shell, either Powershell or bash terminal (for windows users, consider GitBash).

## 1. Login and Select Subscription

1. Login: `az login`  
2. Select subscription:
    `az account set -s <your subscription ID>`  
    - To find your subscription ID, run `az account subscription list` in a terminal or go to [portal.azure.com](https://portal.azure.com) and search for `subscription` in the search bar after logging in.
3. Choose an automated setup with docker (2a) or manual CLI setup (2b).

    - If you want to get going quickly, choose the automated setup with docker (2a).
    - If you want to edit the code and/or chose resource names, choose the manual CLI set up (2b).

## 2a. Automated Deploy with Docker

This option will automatically generate random names for your resources and requirers no input from you. The code needs to be pulled to a location in your local environment. 

  1. Navigate to `/azure-cloud-services` directory in shell terminal..
  2. Deploy. 
      - In Bash: `./docker/run.sh deploy`  
      - In Powershell: `.\docker\run.ps1 deploy` 
  
      **NOTE**: This process may take up to several or more minutes to complete.

  3. Load Outputs to Variables - A file containing important values was saved to `outputs`. Load those variables so subsequent processes can use them. Run the following command:

      `source outputs`

  _Note: When running Docker Desktop, be sure to select the appropriate drives where your files are located._  

## 2b. Manual deployment

This option allows you to choose names for your resources and give you greater control.

  1. Create a Resource Group.  
     - Create a new Resource Group to conveniently track these resources (`eastus` is used as a default location)  
     ```sh
     az group create --resource-group <your resource group name> --location eastus
     ```
  2. (Optional) Transpile .bicep to ARM template. 
     - If you make changes to the Bicep code, you need to first transpile to an ARM template. The ARM template as included has already been transpiled, so this step is only needed if you edit the bicep code.  

         1. In a terminal, navigate to the `azure-cloud-services` directory (this one).  
         2. Transpile the [.bicep file](azuredeploy.bicep) into ARM template with the following command:  
            ```
            bicep build azuredeploy.bicep
            ```

  3. Deploy ARM template. The template takes in three parameters:

     - _param_serviceBus_name_
     - _param_iotHub_name_
     - _param_acr_name_

     **Note:** These values must be **globally unique** and valid DNS names.

     There are multiple ways to deploy. Chose whatever you are most comfortable with.

     **Option #1:** Manually key in values.

     _*Windows User Note:* If you are using git bash, choose one of the following methods or run in powershell. This method is known to not work in git bash._

     ```
     az deployment group create --template-file azuredeploy.json --resource-group <your resource group name>
     ```

     You will be prompted with the following:

     ```
     Please provide string value for 'param_serviceBus_name' (? for help): myservicebus42
     Please provide string value for 'param_iotHub_name' (? for help): myiotbus42
     Please provide string value for 'param_acr_name' (? for help): myacr42
     ```

     **Option #2:** Enter values in command line.

     ```sh
     az deployment group create --template-file azuredeploy.json --parameters param_serviceBus_name=myservicebus42 param_iotHub_name=myiothub42 param_acr_name=myacr42 --resource-group <your resource group here>
     ```

     **Option #3:** Use the parameters file.

     You can also edit the [parameters file](azuredeploy.parameters.json) if you want to save your custom names or change defaults.

     _Modified azuredeploy.parameters.json file:_

     ```json
      "parameters": {
         "param_serviceBus_name": {
         "value": "myservicebus42"
         },
         "param_iotHub_name": {
         "value": "myiothub42"
         },
         "param_acr_name": {
         "value": "test-acr"
         }
      }  
      ```

      _CLI command to use parameters file:_

      ```
      az deployment group create --resource-group <your resource group name> --template-file azuredeploy.json --parameters azuredeploy.parameters.json
      ```

# Next Steps 

Once your Azure Cloud Services are deployed you can continue with the next steps in the [README](../README.md#get-started).

# Resources

This template creates the following resources:

- [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/)
- [Service Bus](https://azure.microsoft.com/en-us/services/service-bus/)
- [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/)
  - ACR is not used by default but included in case needed.

# Clean Up

**You** are responsible for cleaning up your own resources. Conveniently, they are all installed in a single resource group. 

You can do this from the Portal or with this command:

```bash
az deployment group delete --resource-group <your resource group name> --name <your deployment name>
```

# Common Issues & Troubleshooting

- A small subset of Windows users are not able to run the automated script with Docker. If you see an error regarding `Docker.ApiServices.Mounting.FileSharing` or `DockerExceptionFilesharing` you may have a similar issue. You will need to run the manual setup in this case.
- If you see an error regarding connecting to `login.microsoftonline.com `, you may have an issue with your Azure credentials (stored in `~/.azure`). Try to `az login` first. If this works, but you still get an error when running `./docker/run.sh deploy`, you may have to take the manual approach.  