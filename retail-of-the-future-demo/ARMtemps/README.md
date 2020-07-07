# Azure Deployment Instructions

Below are two methods for deploying the required Azure resources.

## Resources To Be Created:

- IoT Hub
- IoT Hub Consumer Group
- Azure Container Registry
- Storage Accounts
    - Storage for Stockout Images
    - Storage for persisting Face API data
    - Storage for diagnostics
- SQL Server
- SQL Database
- Cognitive Services Account
- LUIS Authoring Account
- Custom Speec Account
- Cosmos DB
- ASA Job
- Azure Function
    - Server Farm
    - App Insights
    - Web App
    - Web App Configuration
    - Host Name Binding




## Method 1: Via Clickable Shortcut (Recommended)

This is the quickest and easiest way to deploy.

1. Double click the "deploy_AZ_assest - Shortcut" file.
> You may be informed that you are installing modules from an untrusted repository.
> This is the Azure PowerShell module. Type "Y" to confirm installation.
2. A window will pop up prompting you to sign into Azure. Sign in and continue to step three.
3. Input a Resource Group name. (Letters, numbers, and underscores. Must begin with a letter)
4. Input the username you would like used for SQL and VM assets.
5. Input the password you would like used for SQL and VM assets. (Must contain three of the following. lowercase character, uppercase character, number, special character. Must be at least 8 characters long)

After you enter the password resources should begin deploying.

## Method 2: Via PowerShell Commands

This is a lengthier process for deployment but more reliable.

1. Open PowerShell in administrator mode.
2. Use this line of code to allow scripts to run ```Set-ExecutionPolicy -ExecutionPolicy Unrestricted```. When asked if you want to change the execution policy type "Y" to confirm.
3. Now navigate to the directory the ARM template is located in ```{YOURPATHHERE}\Ignite\ARMtemps\```
4. Next enter the path to the deploy_AZ_assets.ps1 script. This should look something like ```{YOURPATHHERE}\Ignite\ARMtemps\deploy_AZ_assets.ps1```
5. Pick up on step 2 of "Via Clickable Shortcut".

## Troubleshooting

Try changing the resource group name. Asset names are partly based off resource group names and some assests require a uniqe name on a global scope.
