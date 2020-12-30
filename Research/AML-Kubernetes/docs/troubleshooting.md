This document is WIP.
1. Use `kubectl` to get logs, and contact suport for support.


# Timeout
Stuff took too long.
Tends to be transient. Try again.

# AgentInstallationFailedDueToExceptions
Encountered an error when attempting AMLK8s agent installation.
Please check the logs for more info.

# ClusterNotReachable
AKS API server cannot be connected. Please make sure AKS sets correct NSG rules and policy to allow AzureMachineLearning service.
To start, read https://docs.microsoft.com/en-us/azure/machine-learning/how-to-network-security-overview

# AttachmentOfPrivateCmAksClusterNotSupported
The attachment of private CmAks clusters in this AML region is currently not supported.
During private preview CmAks is limited to only a few regions. One region is eastus.

# ConflictingArtifactsInCluster
The cluster contains artifacts that may conflict with the AMLK8s agent.
Please make sure the namespaces are clear before starting install.
