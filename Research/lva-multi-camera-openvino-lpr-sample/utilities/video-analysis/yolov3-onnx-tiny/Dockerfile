# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

FROM ubuntu:18.04

WORKDIR /app

# Install runit, python, nginx, and necessary python packages
# Download the Tiny Yolov3model
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip python3-dev libglib2.0-0 libsm6 libxext6 libxrender-dev\
    && cd /usr/local/bin \
    && ln -s /usr/bin/python3 python \
    && pip3 install --upgrade pip \
    && pip install numpy onnxruntime flask pillow gunicorn opencv-python\
    && apt-get clean \
    && apt-get update && apt-get install -y --no-install-recommends \
    wget runit nginx \
    && cd /app \
    && wget https://github.com/onnx/models/raw/master/vision/object_detection_segmentation/tiny-yolov3/model/tiny-yolov3-11.onnx \
    && wget https://raw.githubusercontent.com/qqwweee/keras-yolo3/master/model_data/coco_classes.txt \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && apt-get purge -y --auto-remove wget

# Copy the app file
COPY app/ .

# Copy nginx config file
COPY yolov3-onnx-tiny-app.conf /etc/nginx/sites-available

# Setup runit file for nginx and gunicorn
RUN mkdir /var/runit && \
    mkdir /var/runit/nginx && \
    /bin/bash -c "echo -e '"'#!/bin/bash\nexec nginx -g "daemon off;"\n'"' > /var/runit/nginx/run" && \
    chmod +x /var/runit/nginx/run && \
    ln -s /etc/nginx/sites-available/yolov3-onnx-tiny-app.conf /etc/nginx/sites-enabled/ && \
    rm -rf /etc/nginx/sites-enabled/default && \
    mkdir /var/runit/gunicorn && \
    /bin/bash -c "echo -e '"'#!/bin/bash\nexec gunicorn -b 127.0.0.1:8888 --chdir /app yolov3-onnx-tiny-app:app\n'"' > /var/runit/gunicorn/run" && \
    chmod +x /var/runit/gunicorn/run && \
    cd /app

# Start runsvdir
CMD ["runsvdir","/var/runit"]
