FROM microsoft/windowsservercore
MAINTAINER Harmeet Singh

COPY Deploy-AzureResourceGroup.ps1 c:/MongoHADRDemo/
COPY azurestackdeploy.parameters.json c:/MongoHADRDemo/
COPY AzureTool.psm1 c:/MongoHADRDemo/
COPY MongoDR c:/MongoHADRDemo/MongoDR
COPY MongoHA c:/MongoHADRDemo/MongoHA
COPY Nested c:/MongoHADRDemo/Nested
COPY Scripts c:/MongoHADRDemo/Scripts
RUN powershell
