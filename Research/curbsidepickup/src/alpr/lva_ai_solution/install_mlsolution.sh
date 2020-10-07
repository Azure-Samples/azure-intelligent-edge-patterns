#!/bin/bash
DEBIAN_FRONTEND=noninteractive

apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        supervisor

# Install Nchan module. For details goto http://nchan.io
apt-get update -y && \
    apt-get install -y libnginx-mod-nchan

/etc/init.d/nginx restart

rm -rf /var/lib/apt/lists/*

rm /etc/nginx/sites-enabled/default && \
    cp /code/nginx/app /etc/nginx/sites-available/ && \
    ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/ && \
    pip install -r /code/requirements.txt && \       
    /opt/conda/bin/conda clean -ya