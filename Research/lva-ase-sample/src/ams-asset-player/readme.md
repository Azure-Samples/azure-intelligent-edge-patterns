# ASP .NET core app for playing Media Services Assets

This directory contains an ASP dotnet core sample app that showcases how to playback assets recorded by Live Video Analytics on IoT Edge

## Contents

Most of the files in the folder are automatically generated when you create an ASP dotnet core project. The additional files are as follows.

* **amsHelper.cs** - Contains code for invoking calls to Azure Media Services.
* **.gitignore** - Defines what git should ignore at commit time.

This sample uses [Azure Media Player](https://aka.ms/azuremediaplayer) to host an embedded player in the browser. The code for that can be found in **./Pages/Index.cshtml** and **./Pages/Index.cshtml.cs**.

## Setup

To your local clone of this git repository, create a file called **appsettings.development.json** and copy the contents from **appsettings.json** into it. Provide values for all parameters under the AMS section. Read [How to access Media Services API](https://docs.microsoft.com/en-us/azure/media-services/latest/access-api-howto) to understand how to get the values for these parameters.

## Running the sample

* From Visual Studio Code menu, select **View --> Run** and then click on the drop-down at the top of the "Run" pane and select **"AMS Asset Player - ASP .NET core"**.
* Hit F5 to start debugging. This will result in your browser getting launched.
* Enter the name of the Media Services asset that you would like to play and hit the Submit button.

## Next steps

Review [this](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/playback-multi-day-recordings-tutorial) tutorial on how to create a multi-day recording, and try the other features of this application
