FROM jupyter/datascience-notebook:latest

USER root

RUN  apt-get -yq update && \
     apt-get -yqq install ssh

USER jovyan

RUN pip install pysftp

ADD ./jupyter-entrypoint.sh . 

ENV SFTP_HOST=sftp.mlflow
ENV NB_PREFIX /

ENTRYPOINT [ "./jupyter-entrypoint.sh" ]