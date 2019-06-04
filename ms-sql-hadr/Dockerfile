FROM microsoft/windowsservercore
MAINTAINER anajod@microsoft.com

COPY HA c:/SqlHADR/HA
COPY DR c:/SqlHADR/DR
COPY Deploy-AzureResourceGroup.ps1 c:/SqlHADR/
COPY LoginModule.psm1 c:/SqlHADR/

CMD powershell c:/SqlHADR/Deploy-AzureResourceGroup.ps1
