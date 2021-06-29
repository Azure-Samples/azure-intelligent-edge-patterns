FROM ubuntu:18.04
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install runit, python, nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender-dev unzip \
    make cmake automake gcc g++ pkg-config \
    python-dev python3-dev \
    python-pip python3-pip \
    wget runit nginx \
    python3-numpy python3-opencv python3-h5py \
    libhdf5-serial-dev hdf5-tools libhdf5-dev libhdf5-100 \
    zlib1g-dev zip libjpeg8-dev liblapack-dev libblas-dev gfortran

RUN apt -y autoremove && \
    apt -y autoclean && \
    apt -y clean && \
    rm -rf /var/lib/apt/lists/*

# Set timezone
ENV TZ=Asia/Taipei
RUN ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

# Set locale
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

RUN cd /usr/local/bin && \
    ln -s /usr/bin/python3 python && \
    pip3 install --upgrade pip

# Copy the requirements.txt file
RUN cd /app
COPY app/requirements.txt .

# Install requirements packages
RUN pip install setuptools wheel testresources
RUN pip install -r requirements.txt

# Copy the app file
RUN cd /app
COPY app/ .

# Copy nginx config file
COPY yolov3-ovms-app.conf /etc/nginx/sites-available

# Setup runit file for nginx and gunicorn
RUN mkdir /var/runit && \
    mkdir /var/runit/nginx && \
    /bin/bash -c "echo -e '"'#!/bin/bash\nexec nginx -g "daemon off;"\n'"' > /var/runit/nginx/run" && \
    chmod +x /var/runit/nginx/run && \
    ln -s /etc/nginx/sites-available/yolov3-ovms-app.conf /etc/nginx/sites-enabled/ && \
    rm -rf /etc/nginx/sites-enabled/default && \
    mkdir /var/runit/gunicorn && \
    /bin/bash -c "echo -e '"'#!/bin/bash\nexec gunicorn -b 127.0.0.1:8888 --chdir /app yolov3-ovms-app:app\n'"' > /var/runit/gunicorn/run" && \
    chmod +x /var/runit/gunicorn/run && \
    cd /app

# Start runsvdir
CMD ["runsvdir","/var/runit"]

