@ECHO OFF
SET AZURE_CORE_NO_COLOR=
SET AZURE_CORE_ONLY_SHOW_ERRORS=True

REM ARM deployment script for Custom Vison solution (Free SKU)
SET custom-vision-arm=deploy-custom-vision-arm.json
REM edge-deployment-json is the template, 
SET edge-deployment-json=deployment.gpu.amd64.json
REM edge-deploy-json is the deployment description with keys and endpoints added
SET edge-deploy-json=deploy.modules.json
REM the solution resource group name
SET rg-name=visiononedge-rg

REM az-subscripton-name = The friendly name of the Azure subscription
REM iot-hub-name = The IoT Hub that corisponds to the ASE device
REM iot-hub-con-str = The owner connection string for IoT Hub - Note this should be removed in future build
REM edge-device-id = The device id of the ASE device
REM cv-training-api-key = The Custom Vision service training key
REM cv-training-endpoint = The Custom Vision service end point

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
    REM This assumes an upper limit of 26 on any list to be chosen from
    REM Underscore is necessary as all other constructs are 1 based so lines up with 1 based for loop next
    SET alpha=_abcdefghijklmnopqrstuvwxyz
    FOR /L %%G IN (1,1,!count!) DO (
        SET char=!alpha:~%%G,1!
        ECHO !char!     !var%%G!
    )
    ECHO.
    SET choose=!alpha:~1,%count%!
    CHOICE /c !choose! /m "Choose the letter corisponding to your tenant" /n
    CALL SET az-subscripton-name=%%var!errorlevel!%%
    CALL ECHO "you chose:" "!az-subscripton-name!"
    CALL az account set --subscription "!az-subscripton-name!" --only-show-errors
)

REM ############################## Install Custom Vision ###########################

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

GOTO :NOEXISTINGCV
:EXISTINGCV
SET /P cv-training-endpoint="Please enter your Custom Vision endpoint: "
SET /P cv-training-api-key="Please enter your Custom Vision Key: "

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
    REM This assumes an upper limit of 26 on any list to be chosen from
    REM Underscore is necessary as all other constructs are 1 based so lines up with 1 based for loop next
    SET alpha=_abcdefghijklmnopqrstuvwxyz
    FOR /L %%G IN (1,1,!count!) DO (
        SET char=!alpha:~%%G,1!
        ECHO !char!     !var%%G!
    )
    ECHO.
    SET choose=!alpha:~1,%count%!
    CHOICE /c !choose! /m "Choose the letter corisponding to your iothub" /n
    CALL SET iot-hub-name=%%var!errorlevel!%%
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
        ECHO !char!     !var%%G!
    )
    ECHO.
    SET choose=!alpha:~1,%count%!
    CHOICE /c !choose! /m "Choose the letter corisponding to your iot device" /n
    CALL SET edge-device-id=%%var!errorlevel!%%
    CALL ECHO you chose: !edge-device-id!
)

REM ############################## Write Config ############################################

REM clear file if it exists
ECHO. > %edge-deploy-json%

FOR /f "delims=" %%i IN (%edge-deployment-json%) DO (
    SET "line=%%i"
    SET "line=!line:<Training API Key>=%cv-training-api-key%!"
    SET "line=!line:<Training Endpoint>=%cv-training-endpoint%!"
    ECHO !line! >> %edge-deploy-json%
)

REM ############################## Deploy Edge Modules #####################################

ECHO Deploying conatiners to Azure Stack Edge
ECHO This will take > 10 min at normal connection speeds.  Status can be checked on the Azure Stack Edge device
SET count=-1
FOR /F "tokens=* USEBACKQ" %%F IN (`az iot edge set-modules --device-id %edge-device-id% --hub-name %iot-hub-name% --content %edge-deploy-json%`) DO (
  SET var!count!=%%F
  SET /a count=!count!+1
)
ECHO installation complete

ECHO solution set to deploy on the %edge-device-id% device, from the %iot-hub-name% hub

ENDLOCAL
