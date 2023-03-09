
FROM ubuntu:18.04

USER root

ARG WORK_DIR=/isserver
ENV WORK_DIR ${WORK_DIR}
ENV PATH /opt/miniconda/bin:${PATH}

RUN mkdir -p ${WORK_DIR}

WORKDIR ${WORK_DIR}

#
# Install base
#
RUN apt-get update &&\
    apt-get install -y --no-install-recommends \
        # Essentials
        wget \
        locales \
        # Python environment
        python3 \
        python3-setuptools &&\
    #
    # Dependencies: conda
    wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-4.5.11-Linux-x86_64.sh -O ${WORK_DIR}/miniconda.sh --no-check-certificate &&\ 
    /bin/bash ${WORK_DIR}/miniconda.sh -b -p /opt/miniconda &&\
    #
    # Cleaning
    /opt/miniconda/bin/conda clean -ya &&\
    rm -rf /opt/miniconda/pkgs &&\
    rm -rf /var/lib/apt/lists/*

#
# Install OpenVINO™
#
#COPY l_openvino_toolkit_p_2020.1.023.tgz ${WORK_DIR}
RUN apt-get update &&\
    apt-get install -y --no-install-recommends \
        # Essentials
        cpio \
        udev \
        unzip \
        autoconf \
        automake \
        libtool

RUN wget --quiet "http://registrationcenter-download.intel.com/akdlm/irc_nas/16670/l_openvino_toolkit_p_2020.3.194.tgz" -O ${WORK_DIR}/l_openvino_toolkit_p_2020.1.023.tgz &&\
    pattern="COMPONENTS=DEFAULTS" &&\
    replacement="COMPONENTS=intel-openvino-ie-sdk-ubuntu-bionic__x86_64;intel-openvino-ie-rt-cpu-ubuntu-bionic__x86_64;intel-openvino-ie-rt-vpu-ubuntu-bionic__x86_64;intel-openvino-opencv-lib-ubuntu-bionic__x86_64" &&\
    tar -xzf l_openvino_toolkit*.tgz &&\
    rm -rf l_openvino_toolkit*.tgz &&\
    cd l_openvino_toolkit* &&\
    sed -i "s/$pattern/$replacement/" silent.cfg &&\
    sed -i "s/decline/accept/g" silent.cfg &&\
    /bin/bash ./install.sh -s silent.cfg &&\
    cd - &&\
    cd /opt/intel/openvino/install_dependencies &&\
    /bin/bash ./install_openvino_dependencies.sh &&\
    # setup environment variables
    echo "source /opt/intel/openvino/bin/setupvars.sh" >> /root/.bashrc &&\
    #
    # Cleaning
    cd ${WORK_DIR} &&\
    rm -rf * &&\
    /opt/miniconda/bin/conda clean -ya &&\
    rm -rf /opt/miniconda/pkgs &&\
    rm -rf /var/lib/apt/lists/*

#
# Set environment variables as in ${INTEL_OPENVINO_DIR}/bin/setupvars.sh
ENV INTEL_OPENVINO_DIR /opt/intel/openvino
ENV LD_LIBRARY_PATH ${INTEL_OPENVINO_DIR}/opencv/lib:${INTEL_OPENVINO_DIR}/deployment_tools/ngraph/lib:/opt/intel/opencl:${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/hddl/lib:${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/gna/lib:${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/mkltiny_lnx/lib:${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/tbb/lib:${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/lib/intel64
ENV INTEL_CVSDK_DIR ${INTEL_OPENVINO_DIR}
ENV OpenCV_DIR ${INTEL_OPENVINO_DIR}/opencv/cmake
ENV InferenceEngine_DIR ${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/share
ENV PYTHONPATH ${INTEL_OPENVINO_DIR}/python/python3.7:${INTEL_OPENVINO_DIR}/python/python3:${INTEL_OPENVINO_DIR}/deployment_tools/open_model_zoo/tools/accuracy_checker:${INTEL_OPENVINO_DIR}/deployment_tools/model_optimizer
ENV PATH ${INTEL_OPENVINO_DIR}/deployment_tools/model_optimizer:/opt/miniconda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH}
ENV HDDL_INSTALL_DIR ${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/hddl

#
# Exclude UDEV by rebuilding libusb without UDEV support
RUN cp ${INTEL_OPENVINO_DIR}/deployment_tools/inference_engine/external/97-myriad-usbboot.rules /etc/udev/rules.d/ &&\
    ldconfig &&\
    cd /opt && wget --quiet --no-check-certificate http://github.com/libusb/libusb/archive/v1.0.22.zip -O /opt/v1.0.22.zip &&\
    unzip v1.0.22.zip && cd libusb-1.0.22 &&\
    ./bootstrap.sh &&\
    ./configure --disable-udev --enable-shared &&\
    make -j4

RUN apt-get update &&\
    apt-get install -y --no-install-recommends libusb-1.0-0-dev &&\
    cd /opt &&\
    rm -rf /var/lib/apt/lists/* &&\
    cd /opt/libusb-1.0.22/libusb &&\
    /bin/mkdir -p '/usr/local/lib' &&\
    /bin/bash ../libtool --mode=install /usr/bin/install -c libusb-1.0.la '/usr/local/lib' &&\
    /bin/mkdir -p '/usr/local/include/libusb-1.0' &&\
    /usr/bin/install -c -m 644 libusb.h '/usr/local/include/libusb-1.0' &&\
    /bin/mkdir -p '/usr/local/lib/pkgconfig' &&\
    cd /opt/libusb-1.0.22/ &&\
    /usr/bin/install -c -m 644 libusb-1.0.pc '/usr/local/lib/pkgconfig' &&\
    ldconfig

#
# Install ML solution
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor &&\
    pip install \
        numpy \
        azure-iot-device
        
ADD . ${WORK_DIR}
ADD etc /etc

RUN rm -rf /var/lib/apt/lists/* &&\
    rm /etc/nginx/sites-enabled/default &&\
    cp ${WORK_DIR}/nginx/app /etc/nginx/sites-available/ &&\
    ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/ &&\
    pip install -r ${WORK_DIR}/requirements.txt &&\
    /opt/miniconda/bin/conda clean -ya &&\
    rm -rf /opt/miniconda/pkgs &&\
    rm -rf /var/lib/apt/lists/*

EXPOSE 5001
CMD ["supervisord", "-c", "/isserver/etc/supervisord.conf"]
