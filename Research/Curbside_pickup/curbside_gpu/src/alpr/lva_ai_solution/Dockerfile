FROM nvidia/cuda:10.1-cudnn7-devel-ubuntu18.04
MAINTAINER Micheleen Harris

ARG WORK_DIR=/code

ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV PATH /opt/conda/bin:$PATH
ENV TORCH_CUDA_ARCH_LIST=Volta;Turing;Kepler+Tesla

RUN mkdir /code

RUN apt-get update && apt-get install -y --no-install-recommends \
         build-essential \
         cmake \
         git \
         curl \
         wget \
         ca-certificates \
         libjpeg-dev \
         libpng-dev \
         swig \
         libgtk2.0-dev && \
     rm -rf /var/lib/apt/lists/*

WORKDIR ${WORK_DIR}

RUN wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.5.12-Linux-x86_64.sh -O ${WORK_DIR}/miniconda.sh && \
    /bin/bash ${WORK_DIR}/miniconda.sh -b -p /opt/conda && \
    rm ${WORK_DIR}/miniconda.sh && \
    ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
    echo "conda activate base" >> ~/.bashrc

# This must be done before pip so that requirements.txt is available
WORKDIR ${WORK_DIR}
COPY . .

# Install python requirements for project
RUN CMAKE_PREFIX_PATH="$(dirname $(which conda))/../" \
    pip install -r requirements.txt

# Compile ops
RUN chmod +x compile_ops.sh && \
    CMAKE_PREFIX_PATH="$(dirname $(which conda))/../" \
    ./compile_ops.sh

RUN chmod -R a+w .

ADD . /code/
ADD etc /etc

# Setup ml solution
COPY install_mlsolution.sh ${WORK_DIR}

RUN cd ${WORK_DIR} && \
    /bin/bash ${WORK_DIR}/install_mlsolution.sh

EXPOSE 5001
CMD ["supervisord", "-c", "/code/etc/supervisord.conf"]