# VisionOnEdge Helm Chart

## Helm Chart Parameters and Information

![Version: 0.1.1](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.24.0](https://img.shields.io/badge/AppVersion-0.24.0-informational?style=flat-square)

Helm chart for VisionOnEdge(VoE) application that deploys VoE modules onto Kubernetes

### Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| azureIoT.edgeConnectionString | string | `nil` |  |
| azureIoT.hubConnectionString | string | `nil` |  |
| captureModule.affinity | object | `{}` |  |
| captureModule.tolerations | list | `[]` |  |
| customVision.endPoint | string | `nil` |  |
| customVision.key | string | `nil` |  |
| inferenceModule.affinity | object | `{}` |  |
| inferenceModule.cpuLimit | string | `nil` |  |
| inferenceModule.tolerations | list | `[]` |  |
| nginxModule.affinity | object | `{}` |  |
| nginxModule.port | int | `8181` |  |
| nginxModule.tolerations | list | `[]` |  |
| predictModule.affinity | object | `{}` |  |
| predictModule.cpuLimit | string | `nil` |  |
| predictModule.numGPUs | int | `1` |  |
| predictModule.tolerations | list | `[]` |  |
| rtspsimModule.affinity | string | `nil` |  |
| rtspsimModule.tolerations | string | `nil` |  |
| runtime.GPU | bool | `false` |  |
| runtime.storageSize | string | `"10Gi"` |  |
| uploadModule.affinity | object | `{}` |  |
| uploadModule.tolerations | list | `[]` |  |
| webModule.affinity | object | `{}` |  |
| webModule.tolerations | list | `[]` |  |

