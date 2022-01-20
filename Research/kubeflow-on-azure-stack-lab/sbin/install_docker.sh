#!/bin/env bash
# Often Docker is already a part of your environment.
# If it is not, here are the idiomatic steps to install it
#

sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

## in some cases you might need this:
# sudo chmod g+rwx "$HOME/.docker" -R

## You might want to re-login to apply your new group memebership
## Testing that docker works:
# docker run hello-world
