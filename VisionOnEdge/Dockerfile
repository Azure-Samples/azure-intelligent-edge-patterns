FROM python:3

RUN mkdir -p /vision_on_edge
COPY requirements.txt /vision_on_edge
COPY ui_production/ /vision_on_edge/ui_production
COPY vision_on_edge/ /vision_on_edge/vision_on_edge
COPY cameras/ /vision_on_edge/cameras
COPY manage.py /vision_on_edge
COPY config.py /vision_on_edge
RUN mkdir -p /vision_on_edge/media

WORKDIR /vision_on_edge
RUN pip install -r requirements.txt

EXPOSE 8000

RUN python manage.py makemigrations
RUN python manage.py migrate
CMD python manage.py runserver 0.0.0.0:8000
