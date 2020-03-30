FROM ubuntu:16.04

# Update image
SHELL ["/bin/bash", "-c"]
WORKDIR /app

# Install Python 3.5 and dependencies for IoT Client SDK
# https://github.com/Azure/azure-iot-sdk-python
RUN apt-get update && \
    apt-get install -y --no-install-recommends libcurl4-openssl-dev \
                                               python3-pip \
                                               python3 \
                                               libboost-python-dev \
                                               python3-dev

# Update pip and install dependencies for installing AzureML SDK
RUN pip3 install --upgrade pip && \
    pip install setuptools && \
    pip install tensorflow==1.10

# Install IoT Device Client SDK and AzureML SDK (requires --upgrade flag)
RUN pip install azure-iothub-device-client && \
    pip install azure-iothub-service-client && \
    pip install azureml-accel-models

COPY assets/ /app/assets

COPY run.py /app
COPY labels.txt /app

ENTRYPOINT ["python3", "run.py"]