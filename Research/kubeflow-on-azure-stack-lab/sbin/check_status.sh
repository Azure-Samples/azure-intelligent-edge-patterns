#!/bin/bash
#
# Checks the status of Kubeflow, (the Kubernetes pods inside namespace "kubeflow")
# This script helps to see the pods when they are created during installation
# or see the pods that are being terminated during uninstallation
#

while :
do
    # This filters out the "ContainerCreating" and other cases,
    # and leaves the title row
    kubectl get pods -n kubeflow | grep -v Running | grep -v Completed
    sleep 30
    echo "Press Ctrl-C to stop..."
done
