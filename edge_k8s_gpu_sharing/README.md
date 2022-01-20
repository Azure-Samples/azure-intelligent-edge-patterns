# Edge Kubernetes GPU Sharing

This demo shows how to deploy multiple gpu-requiring workloads on a cluster with fewer gpu devices than requested.

While steps are similar for Edge Kubernetes or a VM (in regular Azure or Azure Stack), we have separate
chapter to keep the instructions clear:

- [Edge Kubernetes GPU Sharing](kubernetes_gpu_sharing_edge.md)
- [GPU Sharing on a one-node Kubernetes cluster on a VM](kubernetes_gpu_sharing_one_node.md)

# Links

  - https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#view-gpu-driver-information
  - https://nvidia.github.io/gpu-operator/
  - https://github.com/NVIDIA/k8s-device-plugin/blob/examples/workloads/pod.yml
  - [Deploying model to Kubernetes](../machine-learning-notebooks/deploying-on-k8s/README.md)
