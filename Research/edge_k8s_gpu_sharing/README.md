# Edge Kubernetes GPU Sharing

This demo shows how to deploy multiple gpu-requiring workloads on a cluster with fewer gpu devices than requested.

# Pre-requisites

You need an Edge device.

For this exercise we want to run a shell on the device, the following is run in an admin PowerShell window of
your controlling machine(jumpbox):

    > winrm quickconfig
    > $ip = "<your_device_ip>"
    > Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
    > Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell

You will be asked for the password(which you should have if a device access was provisioned)

For more details see [Remotely connect to device from a Windows client](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#remotely-connect-from-a-windows-client)

Or, for Linux environments, [Remotely connect to device from a Linux client](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#remotely-connect-from-a-linux-client)

Here is an example of what you would see from the device shell:

    [10.100.10.10]: PS>Get-HcsApplianceInfo

    Id                            : b2044bdb-56fd-4561-a90b-407b2a67bdfc
    FriendlyName                  : DBE-NBSVFQR94S6
    Name                          : DBE-NBSVFQR94S6
    SerialNumber                  : HCS-NBSVFQR94S6
    DeviceId                      : 40d7288d-cd28-481d-a1ea-87ba9e71ca6b
    Model                         : Virtual
    FriendlySoftwareVersion       : Data Box Gateway 1902
    HcsVersion                    : 1.4.771.324
    IsClustered                   : False
    IsVirtual                     : True
    LocalCapacityInMb             : 1964992
    SystemState                   : Initialized
    SystemStatus                  : Normal
    Type                          : DataBoxGateway
    CloudReadRateBytesPerSec      : 0
    CloudWriteRateBytesPerSec     : 0
    IsInitialPasswordSet          : True
    FriendlySoftwareVersionNumber : 1902
    UploadPolicy                  : All
    DataDiskResiliencySettingName : Simple
    ApplianceTypeFriendlyName     : Data Box Gateway
    IsRegistered                  : False


# Defining GPU device visibility

An average deployment in Kubernetes and common CRDs use `resources->limits` to specify memory/cpu/gpu/etc, for example this:

    ...
              resources: 
                limits:
                  memory: "128Mi"
                  cpu: "200m"
                  nvidia.com/gpu: 1
    ...

would request an allocation of one gpu device, 200 millicpu (0.2 or 20% of the cpu), and 128 MB.

Unless your system has a device that has not been allocated, requesting one with `nvidia.com/gpu: 1` will result in an error
and a pod that will freeze in `Pending` state.

    ...
    Events:
    Type     Reason            Age        From               Message
    ----     ------            ----       ----               -------
    Warning  FailedScheduling  <unknown>  default-scheduler  0/2 nodes are available: 2 Insufficient nvidia.com/gpu.
    Warning  FailedScheduling  <unknown>  default-scheduler  0/2 nodes are available: 2 Insufficient nvidia.com/gpu.
    ...

There is an alternative that allows a fractional allocation of GPU resources. It is a preview feagure for Azure Stack Edge Pro,
called Multi-Process Service (MPS).

To enable it(once you have 
[activated your azure Stack Edge Pro device](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-activate),
and [configured compute on that device in the portal](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-configure-compute#configure-compute)):

    > Start-HcsGpuMPS

The allocation is done via environment variable to the Kubernetes GPU operator, so, without requesting a resource limit,
you define a value for `NVIDIA_VISIBLE_DEVICES`, which determins which device is requested to be used for the container.

For example, as modification to [one of our old examples for inference](../../machine-learning-notebooks/deploying-on-k8s),
`deploy_infer2.yaml` will look like this:

    ...
    containers:
    - name: my-infer2
      resources:
        limits:
          # nvidia.com/gpu:  1           <---------- Commenting this out
      env:
      - name: NVIDIA_VISIBLE_DEVICES     <---------- adding this instead,
        value: "0"                       <           means "use device 0"
    ...

This is the only change from that example that we need to do. You now can run inference on the external ip of that service:

    $ python runtest_infer.py
    test_sample size is 62821
    Found: snow leopard, ounce, Panthera uncia

# Observing GPU metrics

If, for example, you create three deployments, you should see at least three processes on gpu:

    [xx.xx.xx.xx]: PS>Get-HcsGpuNvidiaSmi
    K8S-ddddddddd-ddddddd:

    Mon Nov  2 18:13:15 2020
    +-----------------------------------------------------------------------------+
    | NVIDIA-SMI 440.64.00    Driver Version: 440.64.00    CUDA Version: 10.2     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  Tesla T4            On   | 00008439:00:00.0 Off |                    0 |
    | N/A   62C    P0    30W /  70W |  14700MiB / 15109MiB |      7%      Default |
    +-------------------------------+----------------------+----------------------+

    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |    0     74483      C   python                                       109MiB |
    |    0     76365      C   ...b7ee7d45e44b2b71c805b14ad4d9/bin/python 14011MiB |
    |    0    199672      C   python3                                      569MiB |
    +-----------------------------------------------------------------------------+

And you can validate them functioning by running inferences on deployed models simulataneously.

See the scripts `runtest_infer2.py` and `feed_more.ps1` for a way to feed the model servers
with inferencing requests:

    > python.exe .\runtest_infer2.py
    scoring_uri is http://123.45.67.89:5001/score
    test_sample1 size is 62821
    test_sample2 size is 188183
    0:  Found a :: snow leopard, ounce, Panthera uncia
    1:  Found a :: cheeseburger
    2:  Found a :: snow leopard, ounce, Panthera uncia
    3:  Found a :: cheeseburger
    ... cut ...
    96:  Found a :: snow leopard, ounce, Panthera uncia
    97:  Found a :: cheeseburger
    98:  Found a :: snow leopard, ounce, Panthera uncia
    99:  Found a :: cheeseburger
    Time elapsed: 2.5069718 seconds

The GPU utilization should be better with running multiple models, so the asynchronous runs
of, say `runtest_infer3.py` on the second deployment, should be faster than the sequential.

# Links

  - https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-connect-powershell-interface#view-gpu-driver-information
  