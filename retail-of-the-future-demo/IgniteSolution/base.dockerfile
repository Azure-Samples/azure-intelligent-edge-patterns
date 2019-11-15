FROM mcr.microsoft.com/azureml/o16n-sample-user-base/ubuntu-miniconda

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        bzip2 \
        ca-certificates \
        curl \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        vim \
        wget \
        libboost-python1.58-dev \
        protobuf-compiler \
        cmake \
   && rm -rf /var/lib/apt/lists/*

ARG CONDA_DIR=/opt/conda
ARG CONDA_ENV=". /opt/miniconda/etc/profile.d/conda.sh"
ARG ENV_NAME=base
ARG ACTIVATE_ENV="$CONDA_ENV && conda activate $ENV_NAME"
ARG ENV_YAML=environment.yml
ARG TMP_FOLDER=/tmp_setup

ADD ${ENV_YAML} ${TMP_FOLDER}/

RUN ln -s /opt/miniconda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
  echo $ACTIVATE_ENV >> ~/.bashrc

RUN conda env update -f ${TMP_FOLDER}/${ENV_YAML} && \
conda clean -a -y
