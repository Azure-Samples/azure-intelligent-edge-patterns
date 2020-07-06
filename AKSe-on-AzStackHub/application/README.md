# Overview

> This page is part of the "[Deploying Kubernetes Clusters on Azure Stack Hub](/README.md)" deployment guide.

The demo application is based on the [Azure Kubernetes Service Workshop](https://docs.microsoft.com/en-us/learn/modules/aks-workshop/). 

## Application

It is a 3-Tier Web Application using NodeJS and mongoDB:

![application architecture](https://docs.microsoft.com/en-us/learn/modules/aks-workshop/media/01-app-overview.svg)

You can find the application components on GitHub:

* [MicrosoftDocs/mslearn-aks-workshop-ratings-web](https://github.com/MicrosoftDocs/mslearn-aks-workshop-ratings-web)
* [MicrosoftDocs/mslearn-aks-workshop-ratings-api](https://github.com/MicrosoftDocs/mslearn-aks-workshop-ratings-api)

### Container Images

We've as part of this pattern pre-build the Docker container images for you:

* [demo-rating-api](https://hub.docker.com/repository/docker/heoelri/demo-rating-api)
* [demo-rating-web](https://hub.docker.com/repository/docker/heoelri/demo-rating-web)
* [demo-rating-mongodb](https://hub.docker.com/repository/docker/heoelri/demo-rating-mongodb)

The subdirectory mongodb contains a Dockerfile based on mongo (from docker hub) with sample data from [here](https://github.com/MicrosoftDocs/mslearn-aks-workshop-ratings-api/tree/master/data).

### Helm Chart

This directory also contains a helm chart to deploy the whole application.