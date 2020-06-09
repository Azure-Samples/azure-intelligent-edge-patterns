FROM continuumio/miniconda3

WORKDIR /app

ADD . /app

RUN pip install mlflow

EXPOSE 5000

ENTRYPOINT mlflow server --host 0.0.0.0 --port 5000