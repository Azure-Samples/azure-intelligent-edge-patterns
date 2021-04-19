# Data Generator
This is a Node command line utility that will simulate data coming from remote patient devices.

Patient and vital data (also referred to as 'Observations') are generated in the FHIR format (http://hl7.org/fhir/). 

## Prerequisite Software Needed

- [Node](https://nodejs.org/en/download/) _Recommended: 12 or higher_
- [az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## Required Configuration

### Creating a Device for IoT Hub

1. Open a Terminal (or Git Bash session for Windows users) and change the directory to `data-generator`
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
     - **Device Name to be Created**
       - This is simply a human-readable device name, something like `device0001` or `myDevice`
       - This will be referred to as `deviceId` for subsequent commands.
  _Tip: Running a command with no parameters, or with --help, will print a usage message detailing how to use this command._ 
     ```
     ./create-new-device.sh
     ```
  Example usage. Replace the parameters (including the <>) with your resource specific values:
     ```
     ./create-new-device.sh <iotHubResourceName> <deviceName>
     ```
  After running this command, your device is ready for use in IoT Hub.

### Configuring Your Environment

You will need to set the FHIR_API_URL and IOT_HUB_CONNECTION_STRING environment variables in the .env.production file in the `data-generator` directory. The easiest way to accomplish this is to run the `setup-environment.sh` script (see example usage below).

**Prerequisite Setup**

- A working `kubectl` configuration against your target namespace in Kubernetes.
- A working `az` configuration. You may need to run `az login` if you haven't recently.
- IoT Hub resource name
- Device Id for that IoT Hub resource

Run the following script, with your values replacing `<iotHubResourceName>` and `<deviceId>`:
  ```
  ./setup-environment.sh <iotHubResourceName> <deviceId>
  ```

If everything ran correctly, you should see updated values in the .env.production file in the `data-generator` directory. It should look something like this:

```
FHIR_API_URL=http://10.255.180.240:8080
IOT_HUB_CONNECTION_STRING="HostName=my-resource-name.azure-devices.net;DeviceId=coolDevice;SharedAccessKey=TWOlD0XD8fstJ2PbI2H1Ds3JXsxRP/j1u3z556W+W1o="
```
### How to Get FHIR Url in Kubernetes Dashboard
1. [Browse to your Kubernetes Dashboard](../README.md#how-to-access-your-kubernetes-dashboard)
2. Select `fhir-server-deployment` under the Deployments section of the main page (make sure you are in your specific namespace)
3. Select `fhir-server-deployment-...` link under `New Replica Set`
4. Look for the `fhir-server-svc` row. Copy the link that has an `:8080` at the end under the `External Endpoints` column. This is the FHIR API URL.


## Generate and Send Data
After setting the `FHIR_API_URL` and `IOT_HUB_CONNECTION_STRING` above you are now ready to use the data-generator to generate fake patient vitals and send them to the FHIR Server on your Edge device.  Detailed documentation on the commands which are available can be found further down in this document.  

A summary of the steps to generate and send patient data is listed below:
1. If this is the first time you are using the data-generator,  navigate to the `data-generator` folder and run `npm install` to install dependencies.
1. From the `data-generator` folder, run a command to generate data by using `npm` and setting the required parameters such as destination, numberOfPatients, numberOfDays and healthTrend:
    - For example: 
      ```
      npm run addPatientsWithObservations -- --destination fhir --numberOfPatients 2 --numberOfDays 7 --healthTrend worsening
      ```
1. After the command completes, go to the Clinician Dashboard web application hosted on your Edge device to see the generated data displayed on screen. (see below for instructions on getting the URL for the Clinician Dashboard).

### How to Get Dashboard URL from Kubernetes

After generating data, you should access the [Clinician Dashboard](../dashboard/README.md). Here you will be able to see patient data and their vitals show up in real time as processed.

The following command will produce an IP address for you to navigate to in a web browser.
```
kubectl get services dashboard-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}{"\n"}'
``` 

It will look something like this: `10.255.182.235`. If you are having trouble navigating in a web browser, format the URL like this: `http://10.255.182.235/` (with a prefix of `http://`). 

If you encounter any issues where patient or vital data is not showing up on the dashboard, see [Common Issues](./README.md#common-issues-and-troubleshooting) section below to troubleshoot.
  
## Available Data Generation Commands

- **Add Patients**
- **Add Observations**
- **Add Patients With Observations**
- **Delete Patient**

### General Command Usage

- All commands can be run via `npm` (installed with Node):
  ```
  npm run <command-name>
  ```

- All npm commands must have parameters passed in via `--` before specifying parameter names.
- Running a command with no parameters, or with `--help`, will print a usage message detailing how to use it.

  For example:
  ```
  npm run addPatients -- --destination iothub -n 1
  ```

### General Info About Generated Data

- Vitals generated include heart rate (in beats per minute), blood pressure (systolic and diastolic) in mm of Mercury (mmHg), respiratory rate (in breaths per minute), oxygen saturation (known as SPO2) as a percentage, and weight (in pounds).
- Each vital's timestamp is standardized to occur at midnight of the user's local time zone for simplicity. 
- All vitals are generated collectively at the same time. There will always be one of each vital generated (e.g. there are not more frequent pulse readings than blood pressure).
- Trending data (worsening or improving) requires at least 3 days of data to indicate a trend.
- Thresholds indicate state of a particular vital on the Clinician Dashboard: Green indicates vital is within a normal range, yellow indicates slightly low or high values, and red indicates very low or high values.

## Add Patients

The `addPatients` command will add up to 20 patients to the FHIR server. These patients will not yet have vitals.

**NOTE:** Patient data is generated via a connection to the FHIR server. Patients are not created via IoT Hub.

Example usage: This command will generate two patients.
```
npm run addPatients -- -d fhir -n 2
```

Available parameters:
- `-d` or `--destination` (required)
  - `fhir` will send FHIR data directly to the FHIR server (simulating patient data in clinic).
- `-n` or `--numberOfPatients` (required)
  - Number from `1` to `20`: number of patients to generate.

## Add Observations

The `addObservations` command will allow you to add realistically generated vital data for a single patient uuid. The patient uuid must already exist before adding vitals. 

Example usage: This command will generate five days of vital data simulating a healthy patient via IoT Hub. 
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

**NOTE:** Patient data is generated via a connection to the FHIR server. Patients are not created via IoT Hub.

Example usage: This command will generate two new patients, and add five days of vital data simulating a worsening patient via IoT Hub.
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

Example usage: This command will delete the patient with uuid 6e724a83-7fa7-4374-b468-faf42ccf8b06
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

## Common Issues and Troubleshooting

- Vital data for a patient is not showing up after running addObservations or addPatientsWithObservations.
   1. Confirm that your .env.production file has proper values set for FHIR_API_URL and IOT_HUB_CONNECTION_STRING. If not, perhaps you didn't run setup-environment.sh before usage?
   1. If your FHIR_API_URL and IOT_HUB_CONNECTION_STRING look accurate, you may need to troubleshoot in the Kubernetes Dashboard. See more instructions [here](../README.md#how-to-access-your-kubernetes-dashboard).
   1. You will be looking your Subscriber deployment. Via either the Overview or Deployments page, find the `subscriber-deployment` link and click it.
   1. Click the `subscriber-deployment...` link under New Replica Set to navigate to the specific deployment.
   1. Click the 'four line' icon in the top right (View logs).
   1. In the logs, you may see one of these two errors:
      - If you see something resembling the following log line, you will need to reconfigure your Subscriber configuration with the correct IoT Hub connection string.
        ```
        Error occurred with iot-hub-messages/Subscriptions/all-data-sub within my-service-bus.servicebus.windows.net:  Error: Failed to connect
        ```
      - If you see something resembling the following log line, there was an error POSTing data to the FHIR database. You can simply addObservations for that patient again separately.
        ```
        Error when POSTing to FHIR server for correlationId: c81e61fa-e1e1-44ce-ab57-75873c24eb23. Error: Error: Request failed with status code 500
        ```
