#!/bin/bash

#
# This is a simple, local, image. If you would like to use
# it on other machines, push it to DockerHub.
#
sudo docker build -t mytest:gpu .

#
# Run the image we built. 
#
sudo nvidia_docker run mytest:gpu
