---
title: Staged Data Demo Deployment
---

Before you begin
================

Install Docker
--------------

> Install Docker from:
> <https://docs.docker.com/docker-for-windows/install/>

Create a Service Principal for the Azure Deployment
---------------------------------------------------

> ![][1]
>
> ![][2]
>
> ![][3]
>
> ![][4]
>
> ![][5]
>
> The "**Application ID**" will be used during the deployment as the
> "**AzureApplicationId**" PowerShell script parameter.
>
> ![][6]
>
> ![][7]
>
> The "**SDDemoAzureKey**" will be used during the deployment as the
> "**AzureApplicationSecret**" PowerShell script parameter.

Create a Service Principal for the AzureStack Deployment
--------------------------------------------------------

> Repeat the steps above in Azure for an AzureStack Application ID and
> Application Secret.
>
> ![][8]
>
> ![][9]

Install the Demo
================

1.  Create a folder for the Docker Container download

> md SDDemo
>
> ![][10]

2.  Navigate to the folder

> cd SDDemo
>
> ![][11]

3.  Run the following command to download the container

> docker pull \<dockerAccount\>/\<dockerRepo\>:sd-demo
>
> ![][12]![][13]

4.  Run the docker container

> docker run -it \<dockerAccount\>/\<dockerRepo\>:sd-demo powershell
>
> ![][14]

5.  Navigate to the sddemo folder

> cd .\\SDDemo\\
>
> ![][15]

6.  Run the deploy script

> .\\DeploySolution-Azure-AzureStack.ps1
>
> ![][16]

7.  Provide all the input parameters

> ![][17]
>
> Note: The parameters will be similar to the following:

  **AzureApplicationId**            xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  --------------------------------- ----------------------------------------------
  **AzureApplicationSecret**        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  **AzureTenantId**                 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  **AzureStackAADTenantName**       mydomain.onmicrosoft.com
  **AzureStackTenantARMEndpoint**   https://management.westus.mytenant.com/
  **AzureStackcApplicationId**      xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  **AzureStackApplicationSecret**   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  **AzureStackTenantId**            xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

8.  If prompted; enter the Region for the deployment and Application
    Insights

> ![][18]

9.  Type "Y" to allow the NuGet provider to be installed

> ![][19]

10. Monitor the deployment and wait for it to complete

> ![][20]

11. Run some tests using the test app

> ![][21]

12. Verify the data is available from AzureStack and Azure WebApps

> Azure Web App
>
> ![][22]
>
> AzureStack Web App
>
> ![][23]

  [1]: media/image1.png {width="2.85in" height="1.82in"}
  [2]: media/image2.png {width="4.7in" height="0.7in"}
  [3]: media/image3.png {width="1.94in" height="1.5in"}
  [4]: media/image4.png {width="3.56in" height="1.48in"}
  [5]: media/image5.png {width="5.55in" height="2.27in"}
  [6]: media/image6.png {width="5.93in" height="2.56in"}
  [7]: media/image7.png {width="5.23in" height="2.04in"}
  [8]: media/image8.png {width="3.8in" height="3.16in"}
  [9]: media/image9.png {width="3.79in" height="1.68in"}
  [10]: media/image10.png {width="4.42in" height="1.75in"}
  [11]: media/image11.png {width="4.42in" height="1.75in"}
  [12]: media/image12.png {width="4.447916666666667in"
  height="1.7604166666666667in"}
  [13]: media/image13.png {width="4.447916666666667in"
  height="1.7604166666666667in"}
  [14]: media/image14.png {width="4.447916666666667in"
  height="1.7604166666666667in"}
  [15]: media/image15.png {width="4.45in" height="1.76in"}
  [16]: media/image16.png {width="5.85in" height="2.64in"}
  [17]: media/image17.png {width="5.85in" height="2.64in"}
  [18]: media/image18.png {width="7.15in" height="4.56in"}
  [19]: media/image19.png {width="4.436111111111111in"
  height="2.3208333333333333in"}
  [20]: media/image20.png {width="6.41in" height="1.26in"}
  [21]: media/image21.png {width="6.08in" height="3.43in"}
  [22]: media/image22.png {width="5.0in" height="2.65in"}
  [23]: media/image23.png {width="4.99in" height="2.6in"}
