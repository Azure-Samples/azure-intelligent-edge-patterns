# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

FROM ubuntu:18.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends make build-essential wget libssl-dev && \
    wget http://www.live555.com/liveMedia/public/live555-latest.tar.gz && \
    tar -xzf live555-latest.tar.gz && \
    rm -rf live555-latest.tar.gz && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \    
    cd live && \
    ./genMakefiles linux && \
    make && \
    apt-get purge -y --auto-remove wget gcc libc6-dev make

WORKDIR /live/mediaServer

ADD ./win10.mkv /live/mediaServer/media/

EXPOSE 554

ENTRYPOINT [ "./live555MediaServer" ]
