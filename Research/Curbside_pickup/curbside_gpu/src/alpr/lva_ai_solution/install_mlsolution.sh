#!/bin/bash
DEBIAN_FRONTEND=noninteractive

apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        supervisor

rm -rf /var/lib/apt/lists/*

rm /etc/nginx/sites-enabled/default && \
    cp /code/nginx/app /etc/nginx/sites-available/ && \
    ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/ && \
    pip install -r /code/requirements.txt && \       
    /opt/conda/bin/conda clean -ya