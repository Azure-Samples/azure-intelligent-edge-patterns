# Data Generator
This is a Node command line utility which will simulate data coming from remote patient devices.

Patient and vital data (also referred to as 'Observations') are generated in the FHIR format (http://hl7.org/fhir/). 

## Prerequisite Software Needed

- [Node](https://nodejs.org/en/download/) _Recommended: 12 or higher_
- [az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## Required Configuration

### Creating a Device for IoT Hub

TODO: This might benefit with being pulled up to the Root README, but the script lives here for now.

1. Open a Terminal (or Git Bash session in Windows) and change directory to `data-generator`
   - For example (at the root level of this project): 
     ```
     cd data-generator
     ```
1. Run `az login` if you have not recently logged in via `az`.
1. Run the `create-new-device.sh` script to create a device to associate with IoT Hub. This is a one-time operation.
   - Required parameters: 
     - **IoT Hub Resource Name**
       1. Navigate to [portal.azure.com](https://portal.azure.com).
       1. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
       1. Copy the value underneath the `Name` column to your clipboard.
     - **IoT Hub Subscription Id**
       1. Navigate to [portal.azure.com](https://portal.azure.com).
       1. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
       1. Select your IoT Hub resource.
       1. Copy the value under `Subscription ID`
     - **Device Name to be Created**
       - This is simply a human-readable device name, something like `device0001` or `myDevice`
       - This will be referred to as `deviceId` for subsequent commands.
   - _Tip: Running a command with no parameters, or with --help, will print a usage message detailing how to use this command._ 
     ```
     ./create-new-device.sh
     ```
   - Example usage. Replace the parameters (including the <>) with your resource specific values:
     ```
     ./create-new-device.sh <iotHubResourceName> <iotHubSubscriptionId> <deviceName>
     ```
   - After running this command, your device is ready for use in IoT Hub.

### Configuring Your Environment

You will need to set the FHIR_API_URL and IOT_HUB_CONNECTION_STRING environment variables in the .env.production file in the `data-generator` directory. The easiest way to accomplish this is to run the `setup-environment.sh` script.

**Prerequisite Setup**

- A working `kubectl` configuration against your target namespace in Kubernetes.
- A working `az` configuration. You may need to run `az login` if you haven't recently.
- IoT Hub resource name
- Device Id for that IoT Hub resource

In a Terminal (or Git Bash session) open in the `data-generator` directory, run the following script, replacing with your values for `<iotHubResourceName>` and `<deviceId>`:
  ```
  ./setup-environment.sh <iotHubResourceName> <deviceId>
  ```

If everything ran correctly, you should see updated values in the .env.production file in the `data-generator` directory. Should look something like this:

```
FHIR_API_URL=http://10.255.180.240:8080
IOT_HUB_CONNECTION_STRING="HostName=my-resource-name.azure-devices.net;DeviceId=coolDevice;SharedAccessKey=TWOlD0XD8fstJ2PbI2H1Ds3JXsxRP/j1u3z556W+W1o="
```

Now any data generated will be applied to your IoT Hub configuration and FHIR server deployed in Kubernetes.

### How to Access Kubernetes Dashboard

In order to monitor your Kubernetes (k8s) cluster, you will need to configure access via your Azure Stack Edge device's local UI (Azure Stack Edge Dashboard). You can find more detailed documentation here: https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-monitor-kubernetes-dashboard

1. Navigate to your device's Azure Stack Edge Dashboard. 
   - **NOTE:** This is not the Azure Cloud Portal, but the dashboard for your specific Azure Stack Edge device.
1. Navigate to Device in left panel.
1. Download config file from `Download config` link next to `Kubernetes Dashboard` entry.
   - **Keep this in a easy-to-find location**. You will need it any time you navigate to the Kubernetes Dashboard.
1. Navigate to the `Kubernetes Dashboard` link on the same page. This will look something like an IP address, e.g. `https://10.128.44.241:31000`.
   - **Troubleshooting:** If you get a page that won't let you navigate there, type `thisisunsafe` while focused in a Chrome browser window to bypass. This is known as an 'interstitial bypass keyword' and can be used when certificates aren't present in your server configuration and you _absolutely_ trust that this is your site.
1. Select `Kubeconfig` option and use downloaded config file to access
1. Change **namespace** to the namespace you created in the dropdown in the left panel to see pods running in that namespace

### How to Get FHIR Url in Kubernetes Dashboard
1. Select `fhir-server-deployment` under Deployments section of main page (make sure you are in your specific namespace)
1. Select `fhir-server-deployment-...` link under `New Replica Set`
1. Look for the `fhir-server-svc` row. Copy the link that has an `:8080` at the end under the `External Endpoints` column. This is the FHIR API URL.
  
## Available Data Generation Commands

- **Add Patients**
- **Add Observations**
- **Add Patients With Observations**
- **Delete Patient**

### General Command Usage

- All commands can be run via `npm` (installed with Node). Commands can be run like so:
  ```
  npm run <command-name>
  ```

- All npm commands must have parameters passed in via `--` before specifying parameter names.
- Running a command with no parameters, or with `--help`, will print a usage message detailing how to use.

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

## Before Running Any NPM Command

Run this once before running any of the following npm commands. 

```
npm install
```

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