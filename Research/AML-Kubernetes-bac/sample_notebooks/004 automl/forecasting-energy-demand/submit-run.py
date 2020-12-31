from forecasting_helper import align_outputs
import azureml.contrib.core
from azureml.core.compute_target import ComputeTargetException
from azureml.core.compute import ComputeTarget, AmlCompute
import azureml.contrib.core
from azureml.contrib.core.compute.cmakscompute import CmAksCompute
from datetime import datetime
from azureml.train.automl import AutoMLConfig
from azureml.core import Experiment, Workspace, Dataset
import azureml.core
import logging

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from matplotlib import pyplot as plt
import pandas as pd
import numpy as np
import warnings
import os

# Squash warning messages for cleaner output in the notebook
warnings.showwarning = lambda *args, **kwargs: None


print("This notebook was created using version 1.4.0 of the Azure ML SDK")
print("You are currently using version",
      azureml.core.VERSION, "of the Azure ML SDK")

ws = Workspace.from_config()

# choose a name for the run history container in the workspace
experiment_name = 'automl-forecasting-energydemand'

# # project folder
# project_folder = './sample_projects/automl-forecasting-energy-demand'

experiment = Experiment(ws, experiment_name)

output = {}
output['Subscription ID'] = ws.subscription_id
output['Workspace'] = ws.name
output['Resource Group'] = ws.resource_group
output['Location'] = ws.location
output['Run History Name'] = experiment_name

# Choose a name for your cluster.
compute_cluster_name = "cmaks0518"

compute_target = ComputeTarget(workspace=ws, name=compute_cluster_name)
print('Found existing cluster, use it.')

target_column_name = 'demand'
time_column_name = 'timeStamp'

dataset = Dataset.Tabular.from_delimited_files(
    path="https://automlsamplenotebookdata.blob.core.windows.net/automl-sample-notebook-data/nyc_energy.csv").with_timestamp_columns(fine_grain_timestamp=time_column_name)
# Cut off the end of the dataset due to large number of nan values
dataset = dataset.time_before(datetime(2017, 10, 10, 5))

# split into train based on time
train = dataset.time_before(datetime(2017, 8, 8, 5), include_boundary=True)
# split into test based on time
test = dataset.time_between(datetime(2017, 8, 8, 6), datetime(2017, 8, 10, 5))
max_horizon = 48

automl_settings = {
    'time_column_name': time_column_name,
    'max_horizon': max_horizon,
}

automl_config = AutoMLConfig(task='forecasting',
                             primary_metric='normalized_root_mean_squared_error',
                             blacklist_models=[
                                 'ExtremeRandomTrees', 'AutoArima', 'Prophet'],
                             experiment_timeout_hours=0.3,
                             training_data=train,
                             label_column_name=target_column_name,
                             compute_target=compute_target,
                             enable_early_stopping=True,
                             n_cross_validations=3,
                             verbosity=logging.INFO,
                             **automl_settings)

remote_run = experiment.submit(automl_config, show_output=False)
remote_run.wait_for_completion(show_output=True)
best_run, fitted_model = remote_run.get_output()

# Get the featurization summary as a list of JSON
featurization_summary = fitted_model.named_steps['timeseriestransformer'].get_featurization_summary(
)

X_test = test.to_pandas_dataframe().reset_index(drop=True)
y_test = X_test.pop(target_column_name).values
# The featurized data, aligned to y, will also be returned.
# This contains the assumptions that were made in the forecast
# and helps align the forecast to the original data
y_predictions, X_trans = fitted_model.forecast(X_test)

df_all = align_outputs(y_predictions, X_trans, X_test,
                       y_test, target_column_name)


# use automl metrics module
scores = metrics.compute_metrics_regression(
    df_all['predicted'],
    df_all[target_column_name],
    list(constants.Metric.SCALAR_REGRESSION_SET),
    None, None, None)

print("[Test data scores]\n")
for key, value in scores.items():
    print('{}:   {:.3f}'.format(key, value))


automl_advanced_settings = {
    'time_column_name': time_column_name,
    'max_horizon': max_horizon,
    'target_lags': 12,
    'target_rolling_window_size': 4,
}

automl_config = AutoMLConfig(task='forecasting',
                             primary_metric='normalized_root_mean_squared_error',
                             # These models are blacklisted for tutorial purposes, remove this for real use cases.
                             blacklist_models=['ElasticNet', 'ExtremeRandomTrees', 'GradientBoosting',
                                               'XGBoostRegressor', 'ExtremeRandomTrees', 'AutoArima', 'Prophet'],
                             experiment_timeout_hours=0.3,
                             training_data=train,
                             label_column_name=target_column_name,
                             compute_target=compute_target,
                             enable_early_stopping=True,
                             n_cross_validations=3,
                             verbosity=logging.INFO,
                             **automl_advanced_settings)

advanced_remote_run = experiment.submit(automl_config, show_output=False)
advanced_remote_run.wait_for_completion()
best_run_lags, fitted_model_lags = advanced_remote_run.get_output()
# The featurized data, aligned to y, will also be returned.
# This contains the assumptions that were made in the forecast
# and helps align the forecast to the original data
y_predictions, X_trans = fitted_model_lags.forecast(X_test)

df_all = align_outputs(y_predictions, X_trans, X_test,
                       y_test, target_column_name)


# use automl metrics module
scores = metrics.compute_metrics_regression(
    df_all['predicted'],
    df_all[target_column_name],
    list(constants.Metric.SCALAR_REGRESSION_SET),
    None, None, None)

print("[Test data scores]\n")
for key, value in scores.items():
    print('{}:   {:.3f}'.format(key, value))
