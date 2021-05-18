# VisionOnEdge Helm Chart

## Helm Chart Parameters and Information

![Version: 0.1.2](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.24.0](https://img.shields.io/badge/AppVersion-0.24.0-informational?style=flat-square)

Helm chart for VisionOnEdge(VoE) application that deploys VoE modules onto Kubernetes. 

#### Note: You can only deploy OpenCV implementation of VoE onto Kubernetes. LVA implementation is not yet available for deployment onto Kubernetes. 

### Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| azureIoT.hubConnectionString* | string | `nil` | Your Azure IoT Hub Connection String |
| azureIoT.edgeConnectionString* | string | `nil` | Your Azure IoT Edge Device Connection String |
| customVision.endPoint* | string | `nil` | Your Azure Custom Vision Endpoint |
| customVision.key* | string | `nil` | Your Azure Custom Vision Key |
| runtime.GPU | bool | `false` | Sets the runtime of the solution to GPU. This value does not install Nvidia drivers so make sure your cluster has a GPU and the drivers are properly installed before enabling GPU |
| runtime.storageSize | string | `"10Gi"` | Size of the Storage Volume used by UploadModule and RtspSimModule |
| captureModule.affinity | object | `{}` | Affinity rule for CaptureModule |
| captureModule.tolerations | list | `[]` | Tolerations for CaptureModule |
| inferenceModule.affinity | object | `{}` | Affinity rule for InferenceModule |
| inferenceModule.tolerations | list | `[]` | Tolerations for InferenceModule |
| inferenceModule.cpuLimit | string | `nil` | Sets a CPU Limit for InferenceModule |
| nginxModule.affinity | object | `{}` | Affinity rule for NginxModule |
| nginxModule.tolerations | list | `[]` | Tolerations for NginxModule |
| nginxModule.port | int | `8181` | Your deployments port. You will use this port to view and interact with Solutions' UI |
| predictModule.affinity | object | `{}` | Affinity rule for PredictModule |
| predictModule.tolerations | list | `[]` | Tolerations for PredictModule |
| predictModule.cpuLimit | string | `nil` | Sets a CPU Limit for PredictModule |
| predictModule.numGPUs | int | `1` | Sets the number of GPUs that can be used by PredictModule  |
| rtspsimModule.affinity | string | `nil` | Affinity rule for RtspSimModule |
| rtspsimModule.tolerations | string | `nil` | Tolerations for RtspSimModule |
| uploadModule.affinity | object | `{}` | Affinity rule for UploadModule |
| uploadModule.tolerations | list | `[]` | Tolerations for UploadModule |
| webModule.affinity | object | `{}` | Affinity rule for WebModule |
| webModule.tolerations | list | `[]` | Tolerations for WebModule |

***These values are required during installation.** 


## Use the Helm Chart

Assuming you have a namespace named `fac-ai` you can install, upgrade and delete VoE using the following commands:

### Install

### Upgarde/Update:

### Delete
