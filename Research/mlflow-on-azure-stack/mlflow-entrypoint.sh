#!/usr/bin/env bash
set -e

ssh-keyscan ${SFTP_HOST} > /root/.ssh/known_hosts

mlflow server \
    --host 0.0.0.0 \
    --port 5000 \
    --backend-store-uri sqlite:////app/storage/mlflow-history.db \
    --default-artifact-root "sftp://demo:demo@$SFTP_HOST/archive"