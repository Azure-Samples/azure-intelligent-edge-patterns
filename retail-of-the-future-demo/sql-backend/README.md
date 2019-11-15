#  SQL Server Backend Setup
This serves to instruct setup and configuration of SQL Server database on Azure Stack.

## Create SQL VM
Run the [deploy.ps1](./arm_template/deploy.ps1) PowerShell script to deploy the SQL VM to your Azure Stack tenant. Before doing so, you will need to modify a few parameters in the [parameters.json](./arm_template/parameters.json) file.

**NOTE:** Be sure to change the following settings in the [parameters.json](./arm_template/parameters.json) file to match your deployment.

Parameters:
* location
* adminUsername
* sqlAuthenticationLogin
* sqlAuthenticationPassword

## Create Database
Connect to your SQL Server instance using your editor of choice (SSMS, Azure Data Studio, etc). Run the following SQL query to create the database we will be using.

`CREATE DATABASE retailexperience`

## Run Create Table Scripts
Run each of the SQL scripts stored [here](./01_create_tables) to generate the database schema for the application backend.

## Insert Sample Data
Run each of the SQL scripts stored [here](./02_insert_data) to generate basic data elements required for application to function.

**NOTE:** You will need to modify the dates in the insertInventory.sql script to include the current date for the Inventory statistics to work properly.

## Create Stored Procedures
Run each of the SQL scripts stored [here](./03_stored_procedures) to create each of the stored procedures required by the application.

## Paste Connection String in IgniteDemoApp Settings

**Example Connection String:**

`Data Source=<your_db_here>;Initial Catalog=retailexperience;User ID=<your_uid_here>;Password=<your_pw_here>;`

See [Settings Page](../IgniteDemoApp/README.md)