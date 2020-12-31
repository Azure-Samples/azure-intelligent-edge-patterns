You can submit a job once you have attached(installed amlk8s operator) a Kubernetes cluster (AKS or Arc Kubernetes) to an AML workspace


1. define experiment

```python
from azureml.core import Experiment
experiment_name = <experiment name>
experiment = Experiment(workspace = ws, name = experiment_name)
```

1. submit run
```python
from azureml.core import ScriptRunConfig

script_rc = ScriptRunConfig(
    source_directory='.',
    script='sklearn.py',
    arguments=['--kernel', 'linear', '--penalty', 1.0],
    compute_target=cmaks_target
)

script_rc.run_config.amlk8scompute.resource_configuration.gpu_count = 1
script_rc.run_config.amlk8scompute.resource_configuration.cpu_count = 1
script_rc.run_config.amlk8scompute.resource_configuration.memory_request_in_gb = 1
 
run = experiment.submit(script_rc)
```

You can find sample notebooks under: https://github.com/Azure/CMK8s-Sample/tree/master/sample_notebooks


