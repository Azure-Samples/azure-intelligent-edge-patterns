# Get a GPU ready IoT Edge Device running on Azure

This short guide compiles the info you need to set up a GPU enabled Azure VM, that allows you to run your IoT Edge modules, as an alternative for Azure Stack Edge.

## Steps

1. Deploy a new Azure VM (Ubuntu Server 18.04 LTS - https://ms.portal.azure.com/#create/Canonical.UbuntuServer1804LTS-ARM) - For Size, pick from GPU family (ie NC6v3 to ensure CUDA instead of GRID)
2. On the created VM, Add an NVIDIA GPU Driver Extension (look under the VM's "Extensions" tab)
3. Setup Docker and Docker-Nvidia by following this guide https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker
4. Install IoT Edge Device as in https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux (**skip the "Install a container runtime" step**, as you have Docker already installed)


## Summary
This leaves you with a ready to use Azure VM with GPU and CUDA drivers, ready to run your GPU dependent Docker loads and IoT Edge modules.

> For direct docker images running, that need GPU for their work, include `--gpus all` in the `docker run` command.