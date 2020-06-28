#!/usr/bin/env bash
set -e

mkdir -p /home/jovyan/.ssh
ssh-keyscan ${SFTP_HOST} > /home/jovyan/.ssh/known_hosts

jupyter notebook \
    --notebook-dir=/home/jovyan \
    --ip=0.0.0.0 \
    --no-browser \
    --allow-root \
    --port=8888 \
    --NotebookApp.token='' \
    --NotebookApp.password='' \
    --NotebookApp.allow_origin='*' \
    --NotebookApp.base_url=${NB_PREFIX}
