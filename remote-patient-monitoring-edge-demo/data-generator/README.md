# Data Generator
This is a Node command line utility which will simulate data coming from remote patient devices.

Patient and vital data (also referred to as 'Observations') are generated in the FHIR format (http://hl7.org/fhir/). 

## Prerequisite Software Needed

- [Node](https://nodejs.org/en/download/). _Recommended: 12 or higher_
- [az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## Required Configuration

### Creating a Device for IoT Hub

TODO: This might benefit with being pulled up to the Root README, but the script lives here for now.

- Open a Terminal at the root level of this project
  - Windows users: Use Git Bash to execute the .sh script.
- Run `az login` if you have not previously logged in via `az`.
- Run the `create-new-device.sh` script to create a device to associate with IoT Hub. This is a one-time operation.
  - TODO: Notes about how to run without parameters to see usage message
  - Example usage (replace the parameters with your resource specific values):
    ```
    ./create-new-device.sh my-iot-hub-resource 1bd01e18-8bda-4d60-8550-f05701b094fa my-new-device-name
    ```
  - Required parameters: 
    - **IoT Hub Resource Name**
      1. Navigate to [portal.azure.com](https://portal.azure.com).
      2. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
      3. Copy the value underneath the `Name` column to your clipboard.
      - TODO: Crib notes from React Native app README
    - **IoT Hub Subscription Id**
      - Navigate to [portal.azure.com](https://portal.azure.com).
      - In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
      - Select your IoT Hub resource.
      - Copy the value under `Subscription ID`
    - **Device Name to be Created**

The following environment variables will need to be set in .env.production at the root level of the project to match your Azure configuration. TODO: Could these instead be environment variables?

TODO: Need to scrub .env.production file of our local URLs.

Ex `.env.production` file: 
```
FHIR_API_URL='http://10.255.182.239:8080'
IOT_HUB_CONNECTION_STRING='HostName=iotHubName.azure-devices.net;DeviceId=12345;SharedAccessKey=678910'
```

- FHIR API Url
  - If you have `~/.kube/config` and `kubectl` set up against the Azure namespace: run this to get FHIR IP: `kubectl get services fhir-server-svc --output jsonpath='{.status.loadBalancer.ingress[0].ip}'`.
    - Create the FHIR API URL like so: `http://<FHIR-IP>:8080`. e.g. `http://10.255.182.239:8080`
  - Alternatively: the FHIR server url will be an IP Address that can be accessed via the Kubernetes Dashboard. See the section below for finding that URL.
- IoT Hub Connection String
  - Constructed in the format: `HostName=<IOT_HUB_RESOURCE_NAME>.azure-devices.net;DeviceId=<DEVICE_ID>;SharedAccessKey=<SHARED_ACCESS_KEY>`
  - How to get IoT Hub Connection String using `az`:
    - Run the following command (you will need to replace `iotHubResourceName` and `deviceId`):
    ```
    az iot hub device-identity connection-string show -n <iotHubResourceName> -d <deviceId> --query connectionString
    ```
  - How to find IoT Hub Connection String in Azure:
     - Navigate to portal.azure.com.
     - In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
     - Select your IoT Hub resource.
     - In the left side panel, go to `IoT Devices`.
     - Select relevant device from the options underneath the **Device ID** column.
     - Your connection string will be the **Primary Connection String**.
     - You can copy this key by clicking on the Copy icon to the right of the field.

### How to Access Kubernetes Dashboard And Determine FHIR URL

TODO: These need to be way more generic (not our specific setup).

- Access k8s dashboard by navigating here to start: ASE Portal: https://10.255.182.230/ (Password is in Sharepoint notes)  
  - TODO: Generic instructions for open source user
- Navigate to Device in left panel
- Download config file from `Download config` link next to Kubernetes Dashboard entry
- Navigate to the Kubernetes Dashboard link on the same page
  - If you get a page that won't let you navigate there, type `thisisunsafe` on the page to bypass
- Select `Kubeconfig` option and use downloaded file to access
- Change **namespace** to the namespace you created in the dropdown in the left panel to see pods running in that namespace
  - (#TODO: Remove this note: If we run into problems during this step we can fallback to using the testnamespace already created to save time)
- Select `fhir-server-deployment` under Deployments section of main page
- Select `fhir-server-deployment-...` link under New Replica Set
- Look for the `fhir-server-service` row. Copy the `:8080` link under External Endpoints column. This is the FHIR API URL. 
  
## Available Data Generation Commands

- **Add Patients**
- **Add Observations**
- **Add Patients With Observations**
- **Delete Patient**

### General Command Usage

- All commands can be run via `npm` (installed with Node). Commands can be run via `npm run <command-name>`. 
- Run `npm install` once first before running any other `npm` commands.
- All npm commands must have parameters passed in via `--` before specifying parameter names.
- Running a command with no parameters, or with --help, will print a usage message detailing how to use.

For example:
```
npm run addPatients -- --destination iothub -n 1
```

### General Info About Generated Data

- Each vital's timestamp is standardized to occur at midnight of the user's local time zone for simplicity. 
- All vitals are generated collectively at the same time. There will always be one of each vital generated (e.g. there are not more frequent pulse readings than blood pressure).
- Trending data (worsening or improving) requires at least 3 days of data to indicate a trend.
- Thresholds indicate state of a particular vital. Green indicates vital is within a normal range, yellow indicates slightly low or high values, red indicates very low or high values.

### TODO: Information about each vital? 

## Add Patients

The `addPatients` command will add up to 20 patients to the FHIR server. These patients will not yet have vitals.

Example usage. This command will generate two patients via IoT Hub.
```
npm run addPatients -- -d iothub -n 2
```

Available parameters:
- `-d` or `--destination` (required)
  - `iothub` will send FHIR data via IoT_Hub (simulating remote patient data sent via the Azure Cloud).
  - `fhir` will send FHIR data directly to the FHIR server (simulating patient data in clinic).
- `-n` or `--numberOfPatients` (required)
  - Number from `1` to `20`: number of patients to generate.

## Add Observations

The `addObservations` command will allow you to add realistically generated vital data for a single patient uuid. The patient uuid must already exist before adding vitals. 

Example usage. This command will generate five days of vital data simulating a healthy patient via IoT Hub. 
```
npm run addObservations -- -d iothub -u 26255e11-bc4e-4fba-8724-b7264a09cb3d -n 5 -t healthy
```

Available parameters:
- `-d` or `--destination` (required)
  - `iothub` will send FHIR data via IoT_Hub (simulating remote patient data sent via the Azure Cloud).
  - `fhir` will send FHIR data directly to the FHIR server (simulating patient data in clinic).
- `-u` or `--patientUuid` (required)
  - Patient UUID for which to apply vitals. Patient record should already exist.
- `-n` or `--numberOfDays` (required)
  - Number from `1` to `10`: number of days of patient vital data to generate. Data will be generated for each day up until today's date. (e.g. 3 days will generate data for two days ago, one day ago, and today)
- `-t` or `--healthTrend` (required)
  - `healthy` - Healthy patient data. Will stay within green or yellow thresholds.
  - `worsening` - Worsening patient data. Will trigger an event relative to weight, and have general conditions indicating worsening health.
  - `improving` - Improving patient data. Will end up in the green or yellow thresholds, but start from a worse state initially.

## Add Patients With Observations

The `addPatientsWithObservations` command will allow you to create patients and simultaneously add realistically generated vital data for those new patients. This is also the default command for `npm run start`.

Example usage. This command will generate two new patients, and add five days of vital data simulating a worsening patient via IoT Hub.
```
npm run addPatientsWithObservations -- -d iothub --numberOfPatients 2 -t worsening --numberOfDays 5
```

Available parameters:
- `-d` or `--destination` (required)
  - `iothub` will send FHIR data via IoT_Hub (simulating remote patient data sent via the Azure Cloud).
  - `fhir` will send FHIR data directly to the FHIR server (simulating patient data in clinic).
- `--numberOfPatients` (required)
  - Number from `1` to `20`: number of patients to generate.
- `-t` or `--healthTrend` (required)
  - `healthy` - Healthy patient data. Will stay within green or yellow thresholds.
  - `worsening` - Worsening patient data. Will trigger an event relative to weight, and have general conditions indicating worsening health.
  - `improving` - Improving patient data. Will end up in the green or yellow thresholds, but start from a worse state initially.
- `--numberOfDays` (optional)
  - Default is 1 day, or just vitals for today.
  - Number from `1` to `10`: number of days of patient vital data to generate. Data will be generated for each day up until today's date. (e.g. 3 days will generate data for two days ago, one day ago, and today)

## Delete Patient

The `deletePatient` command will delete a patient by uuid.

Example usage. This command will delete the patient with uuid 6e724a83-7fa7-4374-b468-faf42ccf8b06
```
npm run deletePatient -- -u 6e724a83-7fa7-4374-b468-faf42ccf8b06
```

Available parameters:
- `-u` or `--patientUuid` (required)
  - Patient UUID to delete.

# Running Development Mode Commands

All commands can be run in a development mode, against a locally running FHIR server. 

- Commands are in the format `<commandName>:dev`. For example:
  ```
  npm run addPatients:dev -- --destination fhir -n 2
  ```
- `.env.development` configures the URL for the local FHIR server (by default assuming to be run against `http://localhost:8080`)
- `iothub` as a destination is not supported, only `fhir`.
- TODO: Pretty nasty axios error when not running a local FHIR server. Might be something to fix (or at least document).

# README TODOs
- Document what we mean when we say we're creating observations: We mean a set of 6 observations: heart rate, sBP, DBP, resp, sp02, weight
- Make it clear that patients are not created through IOT hub