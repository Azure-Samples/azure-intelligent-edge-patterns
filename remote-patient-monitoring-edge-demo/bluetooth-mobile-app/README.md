![alt text](images/app-splash.png 'Remote Patient Edge Connect splash')

![alt text](images/edgeconnect-app.png 'Remote Patient Edge Connect app screenshots')

# Remote Patient Edge Connect Bluetooth App

This is a mobile app for Android that allows patients to connect with the Bluetooth enabled OMRON Blood Pressure Monitor (model BP7250) and upload vital readings for processing on an Azure Stack Edge.

## Prerequisite Software Needed

- [Node](https://nodejs.org/en/)
- [Java JDK](https://www.oracle.com/java/technologies/javase-downloads.html) - JDK 8 SE is a **_requirement_** for these steps
- [Android Studio](https://developer.android.com/studio)

## Prerequisite Hardware Needed

- [OMRON Blood Pressure Monitor (model BP7250)](https://omronhealthcare.com/products/5-series-wireless-upper-arm-blood-pressure-monitor-bp7250/)

# Building an .apk (Android app) for use on Android Device

**Prerequisite Steps**

- Set up Java JDK
- Install Android Studio and set up ANDROID_SDK_ROOT
- Accept license agreements
- Build a keystore

### Setting up Java JDK

**NOTE: There are additional undocumented steps for configuring any version of Java later than 8. Java 8 (aka 1.8) is recommended.**

1. Run this command in a Terminal or Git Bash session to see if you have your JDK configured already. If you see a 1.8.x version (or newer if you installed a newer version), then you are ready to proceed to step 3.
   ```
   javac -version
   ```
1. If you do not see your newest Java installation in Step 1, determine the path to your newly installed JDK.
   - Tip: On a Windows PC, look for `jdk1.8...` by running:
     ```
     ls "C:\Program Files\Java"
     ```
   - Tip: On a Mac, look for `jdk1.8...` by running:
     ```
     ls /Library/Java/JavaVirtualMachines/
     ```
1. Set your JAVA_HOME variable in your `~./bashrc` file (or shell file of choice).
   - If you do not have a `~/.bashrc` file (check by runnning `cat ~/.bashrc`), you can create one by running
     ```
     touch ~/.bashrc
     ```
   - Add JAVA_HOME using full path to JDK from Step 2. (replace the path and be sure to wrap it in single quotes as shown). e.g.:
     ```
     echo "export JAVA_HOME='/c/Program Files/Java/jdk1.8.0_281'" >> ~/.bashrc
     ```
1. Add JDK bin path to your PATH variable. The `bin` folder will be under the JDK path from Step 2.
   - For Windows (be sure to replace with your JDK path):
     ```
     export PATH="$PATH:/c/Program Files/Java/jdk1.8.0_281/bin"
     ```
   - For Mac (be sure to replace with your JDK path):
     ```
     export PATH="$PATH:/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/bin"
     ```
1. Source your updated `~/.bashrc` in the terminal:
   ```
   source ~/.bashrc
   ```

### Install Android Studio

1. Download [Android Studio](https://developer.android.com/studio) if you haven't already.
1. Follow steps to install, then launch Android Studio. You will need to install more tools on first launch. If you see a path for Android SDK, take note of it for later.
1. Make sure your Android SDK is configured correctly. You should see files installed here (or a similar location) after running the following command to check:
   - On Windows:
     ```
     ls $HOME/AppData/Local/Android/Sdk
     ```
   - On Mac:
     ```
     ls ~/Library/Android/sdk
     ```
1. The path above will be stored as your ANDROID_SDK_ROOT
   - For Windows (be sure to replace with your Android SDK path):
     ```
     echo 'export ANDROID_SDK_ROOT=$HOME/AppData/Local/Android/Sdk' >> ~/.bashrc
     ```
   - For Mac (be sure to replace with your Android SDK path):
     ```
     echo 'export ANDROID_SDK_ROOT=~/Library/Android/sdk' >> ~/.bashrc
     ```
1. Add Platform Tools to your PATH variable. There should be a `platform-tools` directory directly under your $ANDROID_SDK_ROOT directory. This will allow you run command like `adb` from any directory.
   - For Windows (be sure to replace with your Android SDK path):
     ```
     export PATH="$PATH:$HOME/AppData/Local/Android/Sdk/platform-tools"
     ```
   - For Mac (be sure to replace with your Android SDK path):
     ```
     export PATH="$PATH:~/Library/Android/sdk/platform-tools"
     ```
1. Source your updated `~/.bashrc` in the terminal:
   ```
   source ~/.bashrc
   ```

### Accept License Agreements

1. For a first time run, accept licenses before proceeding by running the following command in a terminal:
   - On Windows:
     ```
     yes | $ANDROID_SDK_ROOT/tools/bin/sdkmanager.bat --licenses
     ```
   - On Mac:
     ```
     yes | $ANDROID_SDK_ROOT/tools/bin/sdkmanager --licenses
     ```

## Building a Keystore

In order to build and sign the Android app for release mode, you will need to generate a keystore file that will be stored locally in the `android/app` directory. This is required to run the application on an Android device.

1. Navigate to the `bluetooth-mobile-app/android/app` directory inside the project folder and open a terminal there.
   - **Windows Users**: On Windows you can open the folder where you downloaded/cloned the project in an explorer window and right-click inside anywhere to select `Git Bash Here`. Another option is to open Git Bash from the Desktop or search bar and navigate to the project folder manually.
2. Run the following command:

```
keytool -genkey -v -keystore my-app-key.keystore -storetype jks -alias my-app-alias -keyalg RSA -keysize 2048 -validity 10000 -deststoretype pkcs12
```

3. There will be a prompt for a password. Type or paste `protract-assail-WILLIWAW` and then hit Return/Enter.

- **Windows Users**: You may need to manually type this password if copying and pasting fails.

4. Type or paste the same password again, then hit Return/Enter.
5. _(Optional)_ Enter Name, Organizational Unit, and Organization, or hit Return/Enter to skip.
6. There will be a prompt that reads `Is CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown correct?` Type `yes` and then hit Return/Enter.
   - Note: This prompt will display your user-entered inputs if they were entered.
7. Verify that `my-app-key.keystore` is now in the `bluetooth-mobile-app/android/app` directory.

## Prerequisite Data Before Building an Android .apk File

The following data is required and will need to be assembled to build an `.apk` file to install on your Android device. It is recommended that you start a text document to copy these values down for later use, since the build command requires these four parameters.

- Patient Id in FHIR Database
- Iot Hub Resource Name
- Device Policy Key
- Device Id

## Patient Id

You will need a patient UUID to associate vital data to.

### Creating a Patient Id

1. In a terminal, navigate to the root directory where the **Data Generator** CLI tool is located.
2. Generate a simulated patient, to apply your vital readings to, using the following command:

   `npm run addPatients -- -d fhir -n 1`

3. After the command is complete, the console will display a patient UUID that you will need later for the command to build an `.apk` file for installation on your Android device.
   - Example console output:
     ```
     Patient Uuids: 9559fe1a-7194-4dc4-89a4-a88e2f58340e
     ```

**NOTE**: You will need to be logged in to your Azure account in order to find the following resource information.

## IoT Hub Resource Name

You will need to determine the IoT Hub resource name that you will send data to.

1. Navigate to https://portal.azure.com.
2. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
3. Copy the value underneath the `Name` column to your clipboard. This will save it for use in the command to generate a `.apk`.

## Device Policy Key

You will need a device policy key in order to securely send data to IoT Hub.

1. Navigate to https://portal.azure.com.
2. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
3. Select your IoT Hub resource.
4. In the left side panel, go to `Shared access policies`.
5. Select `device` from the options underneath the **Policy** column.
6. Your policy key will be the **Primary key** listed under Shared access keys.
7. Copy the policy key by clicking on the Copy icon to the right of the field. This will save it for later use in the command to generate a `.apk`.

## Device Id

You will need a device Id in order to save data for a particular device in IoT Hub.

1. Navigate to https://portal.azure.com.
1. In the Search Bar at the top of the page, type `iot hub` to find the IoT Hub resource.
1. Select your IoT Hub resource.
1. In the left side panel select `IoT devices` (You can search for it in the search bar in the panel).
1. Select the Device you created.
1. Copy the Device Id field value to the clipboard using the copy icon on the right. This will save it for later use in the command to generate a `.apk`.

## Creating an APK Build:

1. Navigate to the root folder of the `bluetooth-mobile-app` project.
1. Run the following script in a terminal using the values you assembled from the `Prerequisite Data Before Building` Section:

   ```
   ./build-release-apk.sh <Patient Id> <IoT Hub Name> <Policy Key> <Device Id>
   ```

   **NOTE**: This process may take up to 15 minutes to complete.

1. The script will produce an .apk file (`app-release.apk`) on your computer at the root project folder in `bluetooth-mobile-app/android/app/build/outputs/apk/release/app-release.apk`.
   - _(Optional)_ Copy this file to a preferred location if you like, e.g.:
     ```
     cp android/app/build/outputs/apk/release/app-release.apk $HOME/Desktop
     ```

## Installing the APK on an Android Device

1. Connect the Android device to your computer via USB. Make sure USB Debugging mode is turned on (See instructions under Enable Debugging Over USB here: https://reactnative.dev/docs/running-on-device).
1. Confirm the device is connected to your computer by running:
   ```
   adb devices
   ```
   You should see something like this if successful:
   ```
   List of devices attached
   96JX21Y9W       device
   ```
1. After the device is connected to your computer, use the `adb` CLI tool to install the APK to your Android device.
1. Make sure you are in the mobile app project folder (`bluetooth-mobile-app`).
1. Run:
   ```
   adb install ./android/app/build/outputs/apk/release/app-release.apk
   ```
   (or run the adb command relative to wherever you copied the file to).
1. The app `Edge Connect` will display on your Android device.
1. Tap on the app icon to start it.

## Taking a Blood Pressure reading with the Omron Series 5 device:

1. Put the arm cuff on your left arm half an inch above your elbow.
1. Rest your arm on a stable surface with the arm cuff level with your heart.
1. Press the `START/STOP` button on your monitor to start recording.
1. If the reading was successful, the results will display on the Omron device screen. The reading is now ready to be synced to the Edge Connect mobile app.
1. Open the `Edge Connect` app on your Android device and follow the onscreen instructions to sync the reading.

### How to Get Dashboard URL from Kubernetes

After successfully syncing data, you should access the [Clinician Dashboard](../dashboard/README.md). Here you will see the new vitals appear in real time as processed.

The following command will produce an IP address for you to navigate to in a web browser.

```
kubectl get services dashboard-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}{"\n"}'
```

The IP address will look something like this: `10.255.182.235`. If you are having trouble navigating in a web browser, format the URL like this: `http://10.255.182.235/` (with a prefix of `http://`).

If you encounter any issues where the patient or vital data is not showing up on the dashboard, see [Common Issues](./README.md#common-issues-and-troubleshooting) section below to troubleshoot.

# Developer Notes

## Running a React Native App on an Android Device

### First Time Setup

Official documentation: https://reactnative.dev/docs/environment-setup

It is recommended that you consult the official React-Native documentation for setting up your environment for development, but a summary of the important steps is listed below.

# Windows

1. Install [Chocolatey](https://chocolatey.org/install)
1. If you don't have the Java JDK installed already (run `javac -version` in a terminal to check), install it by running the following command in a CMD Prompt (in the search bar on the bottom left of your Windows Desktop, search for `cmd` and right click to Run as Administrator):
   ```
   choco install -y openjdk8
   ```
1. Install Android Studio if needed:
   1. Download and run the installer from https://developer.android.com/studio
   1. Open Android Studio and select the "SDK Platforms" tab from within the SDK Manager
   1. Check the box next to "Show Package Details" in the bottom right corner.
   1. Look for and expand the Android 10 (Q) entry, then make sure the following items are checked:
      - Android SDK Platform 29
      - Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image
   1. Select the "SDK Tools" tab and check the box next to "Show Package Details". Look for and expand the "Android SDK Build-Tools" entry, then make sure that 29.0.2 is selected.-
   1. Click "Apply" to download and install the Android SDK and related build tools.

# Mac OS

In summary, to set things up:

1. `brew install node`
1. `brew install watchman`
1. `brew install --cask adoptopenjdk/openjdk/adoptopenjdk8`
1. Install [Android Studio](https://developer.android.com/studio) with the Android SDK
1. Run Android Studio, open the Configure Menu then SDK Manager. Select Android 10 (Q), click "Show package details" and also select Intel x86 Atom_64 System Image. Click Apply to install them.
1. Configure the ANDROID_HOME environment variable (https://reactnative.dev/docs/environment-setup)

### Running on Device

The gist is below, but full details are here which includes connecting over WiFi: https://reactnative.dev/docs/running-on-device

1. Generate a debug keystore for development
   - In a terminal, navigate to `bluetooth-mobile-app/android/app` in the project folder and run the following command to generate a debug keystore file there:
   ```
   keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
   ```
1. Enable USB Debugging on your device (in your Android settings).
1. Plug your device in via USB. Follow the prompts on screen to allow interaction, and run `adb devices` to see a list of connected devices.
   - You should see something resembling this message if everything was done correctly:
     ```
     List of devices attached
     96JX21Y9W       device
     ```
1. In a terminal, navigate to the mobile app project folder (`bluetooth-mobile-app`) and run the command `npm install` to install app dependencies.
1. Run `npx react-native run-android` in a terminal to launch the app on your connected device.

## Common Issues and Troubleshooting

- If you need to update your environment variables in your .env file during local development, you may need to close your Metro bundler terminal sessions and run
  ```
  npx react-native start --reset-cache
  ```
  This will allow you to update the .env values successfully.
- If you get a `No Callback found` redsceen error while connecting to a Bluetooth device during development, you can safely dismiss it by pressing `Dismiss` at the bottom of the screen. This is a non-critical error that will not impact the functionality of the application.
