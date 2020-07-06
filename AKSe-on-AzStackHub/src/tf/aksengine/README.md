# Overview

> This page is part of the "[Deploying Kubernetes Clusters on Azure Stack Hub](/README.md)" deployment guide.

This component is deploying the AKS Engine helper VM to Azure Stack. This sample deployment is developed using Terraform.

## Prerequisites

### Azure Stack Marketplace
| Name | Version | Description |
| --- | --- | --- |
| Ubuntu Server 18.04 LTS | 18.04-LTS (18.04.20200225) | Ubuntu Server Linux Image |

### Terraform

**Environment Variables**

The following enviornment variables are needed for the terraform provider configuration.
| Name | Description |
| -- | -- |
| ARM_ENDPOINT | ARM Management endpoint https://management.* |
| ARM_CLIENT_ID | Service Principal Client ID |
| ARM_CLIENT_SECRET | Service Principal Secret |
| ARM_SUBSCRIPTION_ID | Azure (Stack) Subscription ID |
| ARM_TENANT_ID | Service Principal Tenant ID |

## Result

The result schould contain a VM including a NIC, NSG, PIP, OSDisk and a Virtual Network:

![AKS Engine VM Resources in Azure Stack](/img/aksengine-resources-on-azurestack.png)

The VM itself is already partially pre-configured and contains already the AKS Engine tooling:

![aks-engine command line example](/img/aksengine-cmdline-example.png)