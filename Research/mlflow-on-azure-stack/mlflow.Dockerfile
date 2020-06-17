FROM continuumio/miniconda3

WORKDIR /app

ADD . /app

RUN mkdir -p /app/storage/mlruns && touch mlflow-history.db

RUN pip install mlflow

EXPOSE 5000

ENTRYPOINT mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:////app/storage/mlflow-history.db --default-artifact-root /app/storage/mlruns