@ECHO OFF
SET AZURE_CORE_NO_COLOR=
SET AZURE_CORE_ONLY_SHOW_ERRORS=True

REM ARM deployment script for Custom Vison solution (Free SKU)
SET custom-vision-arm=deploy-custom-vision-arm.json
REM edge-deploy-json is the deployment description with keys and endpoints added
SET edge-deploy-json=deploy.modules.json
REM the solution resource group name
SET rg-name=visiononedge-rg

REM az-subscripton-name = The friendly name of the Azure subscription
REM iot-hub-name = The IoT Hub that corisponds to the ASE device
REM edge-device-id = The device id of the ASE device
REM cv-training-api-key = The Custom Vision service training key
REM cv-training-endpoint = The Custom Vision service end point
REM cpuGpu = CPU or GPU deployment

SETLOCAL ENABLEDELAYEDEXPANSION

REM ############################## Install Prereqs ##############################  

ECHO Installing / updating the IoT extension
CALL az extension add --name azure-iot
IF NOT !errorlevel! == 0 (
  REM Azure CLI is not installed.  It has an MSI installer on Windows, or is available over REST.
  ECHO.
  ECHO It looks like Azure CLI is not installed.  Please install it from: 
  ECHO https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
  ECHO and try again
  ECHO.
  ECHO Press any key to exit...
  PAUSE > noOutput
  GOTO :eof
)
Call az extension update --name azure-iot

REM ############################## Get Tenant ###################################

REM Remove the header and ---- from output list - start good var data at var1
SET count=-1
ECHO Logging on to Azure...
FOR /F "tokens=* USEBACKQ" %%F IN (`az login -o table --query [].name`) DO (
  SET var!count!=%%F
  SET /a count=!count!+1
)
REM Strip off last increment
SET /a count=!count!-1
REM Only one option so no need to prompt for choice
IF !count! leq 1 (
    CALL az account set --subscription "!var1!"
) ELSE (
    REM Underscore is necessary as all other constructs are 1 based so lines up with 1 based for loop next
    FOR /L %%G IN (1,1,!count!) DO (
        SET char=!alpha:~%%G,1!
        ECHO %%G     !var%%G!
    )
    ECHO.
    set /p userinp=Choose the number corisponding to your tenant: 
    set userinp=!userinp:~0,2!
    CALL SET az-subscripton-name=%%var!userinp!%%
    CALL ECHO "you chose:" "!az-subscripton-name!"
    CALL az account set --subscription "!az-subscripton-name!" --only-show-errors
)

REM ############################## Install Custom Vision ###########################

ECHO This tool uses custom vision service to handle projects and training jobs(for more information visit www.customvision.ai)
ECHO You can use your existing Custom Vision service, or create a new one
CHOICE /c yn /m "Would you like to use an existing Custom Vision Service?" /n

REM Using goto here due to issues with delayed expansion
IF %errorlevel%==1 ( GOTO :EXISTINGCV )
ECHO Installing the Custom Vision Service
ECHO.
SET loc1=eastus
SET loc2=westus2
SET loc3=southcentralus
SET loc4=northcentralus

ECHO a      %loc1%
ECHO b      %loc2%
ECHO c      %loc3%
ECHO d      %loc4%
ECHO.
CHOICE /c abcd /m "choose the location" /n

SET location=!loc%errorlevel%!

ECHO you chose: %location%

ECHO Creating resource group - %rg-name%
call az group create -l %location% -n %rg-name%

ECHO Creating Custom Vision Service
SET count=0
REM Need to note in the documentation that only one free service per subscription can be created.  An existing one results in an error.
FOR /F "tokens=* USEBACKQ" %%F IN (`az deployment group create --resource-group %rg-name% --template-file %custom-vision-arm%
    --query properties.outputs.*.value -o table --parameters "{ \"location\": { \"value\": \"%location%\" } }"`) DO ( 
  REM to do: figure out the format for retrieving the training and predition keys here
  SET out!count!=%%F
  SET /a count=!count!+1
)
IF !count! == 0 (
    ECHO.
    ECHO Deployment failed.  Please check if you already have a free version of Custom Vision installed.
    ECHO Press any key to exit...
    PAUSE > noOutput
    GOTO :eof
)

REM Set the Custom Vision variables
SET cv-training-api-key=!out2!
SET cv-training-endpoint=!out3!

ECHO API Key: %cv-training-api-key%
ECHO Endpoint: %cv-training-endpoint%

GOTO :NOEXISTINGCV
:EXISTINGCV

ECHO Endpoint and key information can be found at www.customvision.ai - settings(top right corner)
SET /P cv-training-endpoint="Please enter your Custom Vision endpoint: "
IF "%cv-training-endpoint%"=="" (SET cv-training-endpoint=CUSTOMVISIONTRAININGKEY)
SET /P cv-training-api-key="Please enter your Custom Vision Key: "
IF "%cv-training-api-key%"=="" (SET cv-training-api-key=CUSTOMVISIONENDPOINT)

:NOEXISTINGCV

REM ############################## Get IoT Hub #####################################

REM Remove the header and ---- from output list - start good var data at var1
SET count=-1
ECHO listing IoT Hubs
FOR /F "tokens=* USEBACKQ" %%F IN (`az iot hub list --only-show-errors -o table --query [].name`) DO (
  SET var!count!=%%F
  SET /a count=!count!+1
)
REM Strip off last increment
SET /a count=!count!-1

IF !count! leq 0 (
  ECHO IoTHub not found
  ECHO Sorry, this demo requires that you have an existing IoTHub and registered Azure Stack Edge Device
  ECHO Press any key to exit...
  PAUSE > noOutput
  GOTO :eof
)
REM Only one option so no need to prompt for choice
IF !count! == 1 (
    CHOICE /c YN /m "please confirm install to %var1% hub"
    IF !errorlevel!==2 ( 
      GOTO :eof 
    )
    SET iot-hub-name=%var1%
) ELSE (
    REM Underscore is necessary as all other constructs are 1 based so lines up with 1 based for loop next
    FOR /L %%G IN (1,1,!count!) DO (
        SET char=!alpha:~%%G,1!
        ECHO %%G     !var%%G!
    )
    ECHO.
    SET /p userinp=Choose the number corisponding to your iothub: 
    SET userinp=!userinp:~0,2!
    CALL SET iot-hub-name=%%var!userinp!%%
    CALL ECHO you chose: !iot-hub-name!
)

REM ############################## Get Device #####################################

REM Remove the header and ---- from output list - start good var data at var1
SET count=-1
ECHO getting devices
REM query parameter retrieves only edge devices
FOR /F "tokens=* USEBACKQ" %%F IN (`az iot hub device-identity list -n !iot-hub-name! -o table --query [?capabilities.iotEdge].[deviceId]`) DO (
  SET var!count!=%%F
  SET /a count=!count!+1
)
REM Strip off last increment
SET /a count=!count!-1

IF !count! leq 0 (
  ECHO No edge device found
  ECHO Sorry, this demo requires that you have an existing IoTHub and registered Azure Stack Edge Device
  ECHO Press any key to exit...
  PAUSE > noOutput
  GOTO :eof
)
REM Only one option so no need to prompt for choice
IF !count! == 1 (
    CHOICE /c YN /m "please confirm install to %var1% device"
    IF !errorlevel!==2 ( 
      GOTO :eof 
    )
    SET edge-device-id=%var1%
) ELSE (
    REM This assumes an upper limit of 26 on any list to be chosen from
    REM Underscore is necessary as all other constructs are 1 based so lines up with 1 based for loop next
    SET alpha=_abcdefghijklmnopqrstuvwxyz
    FOR /L %%G IN (1,1,!count!) DO (
        SET char=!alpha:~%%G,1!
        ECHO %%G     !var%%G!
    )
    ECHO.
    SET /p userinp=Choose the number corisponding to your iot device: 
    SET userinp=!userinp:~0,2!
    CALL SET edge-device-id=%%var!userinp!%%
    CALL ECHO you chose: !edge-device-id!
)

REM ################################ Check for GPU ###########################################
CHOICE /c yn /m "Does your Azure Stack Edge device have a GPU?" /n

REM Using goto here due to issues with delayed expansion
IF %errorlevel%==1 ( SET cpuGpu=gpu) ELSE ( SET cpuGpu=cpu)
IF %cpuGpu%==gpu ( SET runtime=nvidia) ELSE ( SET runtime=runc)

REM ################################ Check for Platform ######################################
ECHO 1 amd64
ECHO 2 arm64v8
SET /p userinp=Choose the platform corresponding to your tenant:
IF %userinp% == 2 (
    SET edge-deployment-json=deployment.arm64v8.json
) ELSE (
    SET edge-deployment-json=deployment.amd64.json
)
ECHO.
ECHO Using deployment file "%edge-deployment-json%"
ECHO.

REM ############################## Write Config ############################################

REM clear file if it exists
ECHO. > %edge-deploy-json%


FOR /f "delims=" %%i IN (%edge-deployment-json%) DO (
    SET "line=%%i"
    SET "line=!line:<Training API Key>=%cv-training-api-key%!"
    SET "line=!line:<Training Endpoint>=%cv-training-endpoint%!"
    SET "line=!line:<cpu or gpu>=%cpuGpu%!"
    SET "line=!line:<Docker Runtime>=%runtime%!"
    ECHO !line! >> %edge-deploy-json%
)

REM ############################## Deploy Edge Modules #####################################

ECHO Deploying containers to Azure Stack Edge
ECHO This will take > 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device
SET count=-1
FOR /F "tokens=* USEBACKQ" %%F IN (`az iot edge set-modules --device-id %edge-device-id% --hub-name %iot-hub-name% --content %edge-deploy-json%`) DO (
  SET var!count!=%%F
  SET /a count=!count!+1
)
ECHO installation complete

ECHO solution scheduled to deploy on the %edge-device-id% device, from the %iot-hub-name% hub
ECHO status of deployment can be checked using the command 'sudo iotedge list' on the Azure Stack Edge device
ENDLOCAL
