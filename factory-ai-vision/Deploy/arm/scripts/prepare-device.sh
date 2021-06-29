#!/usr/bin/env bash

####################################################################################################

# This script is designed to run an edge device.
# 
# It does the following:
# - for the rtspsim module, it creates a `samples` folders and downloads sample media into it
# - it creates folders on the host that the edge module will mount
# - it create a local user and group with restricted access for the edge module to use

####################################################################################################

# create the local group and user for the edge module
# these are mapped from host to container in the deployment manifest in the desire properties for the module
sudo groupadd -g 1010 localedgegroup
sudo useradd --home-dir /home/localedgeuser --uid 1010 --gid 1010 localedgeuser
sudo mkdir -p /home/localedgeuser

# create folders to be used by the rtspsim module
sudo mkdir -p /home/localedgeuser/samples
sudo mkdir -p /home/localedgeuser/samples/input

sudo curl https://lvamedia.blob.core.windows.net/public/camera-300s.mkv --output /home/localedgeuser/samples/input/camera-300s.mkv
sudo curl https://lvamedia.blob.core.windows.net/public/lots_284.mkv --output /home/localedgeuser/samples/input/lots_284.mkv
sudo curl https://lvamedia.blob.core.windows.net/public/lots_015.mkv --output /home/localedgeuser/samples/input/lots_015.mkv
sudo curl https://lvamedia.blob.core.windows.net/public/t2.mkv --output /home/localedgeuser/samples/input/t2.mkv

# give the local user access
sudo chown -R localedgeuser:localedgegroup /home/localedgeuser/

# set up folders for use by the Video Analyzer module
# these are mounted in the deployment manifest

# !NOTE! these folder locations are must match the folders used in `deploy-modules.sh` and ultimately the IoT edge deployment manifest

# general app data for the module
sudo mkdir -p /var/lib/videoanalyzer 
sudo chown -R localedgeuser:localedgegroup /var/lib/videoanalyzer/
sudo mkdir -p /var/lib/videoanalyzer/tmp/ 
sudo chown -R localedgeuser:localedgegroup /var/lib/videoanalyzer/tmp/
sudo mkdir -p /var/lib/videoanalyzer/logs
sudo chown -R /localedgeuser:localedgegroup /var/lib/videoanalyzer/logs

# output folder for file sink
sudo mkdir -p /var/media
sudo chown -R localedgeuser:localedgegroup /var/media/