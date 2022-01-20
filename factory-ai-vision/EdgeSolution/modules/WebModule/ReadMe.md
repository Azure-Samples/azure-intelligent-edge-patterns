## Backend

[![Build Status](https://dev.azure.com/FactoryAI-CICD/FactoryAI-CICD/_apis/build/status/Build%20module%20images%20(cpuamd64)?branchName=develop)](https://dev.azure.com/FactoryAI-CICD/FactoryAI-CICD/_build/latest?definitionId=1&branchName=develop)

#### Install

    pip install -r requirements.txt

#### Initial

Use the editor to modify the ```config.py```, fill in the customvision training key and endpoint

Following steps will create new tables in sqlite.db

    python manage.py makemigrations cameras
    python manage.py migrate

#### Dev

    python manage.py runserver


#### Migrate DB

If the database exists but table schema changes, please do followings to migrate the database

    python manage.py makemigrations cameras
    python manage.py migrate

## Front end

    cd ui

#### Initial

To install needed packages

    yarn

#### Dev

This will launch a ui site in localhost:3000

    yarn start


#### APIs

    CRUD by Django Restful :
    Cameras: <http://localhost:8000/api/cameras/>
    Parts: <http://localhost:8000/api/parts/>
    Images: <http://localhost:8000/api/images/>

    Streams:
    Connect a new stream <http://localhost:8000/api/streams/connect>
    This will return a json with stream_id

    Get the real time video feed <http://localhost:8000/api/streams/STREAM_ID/video_feed>
    This will return a dynamic image which can put input <img> directly

    Capture a image <http://localhost:8000/api/streams/STREAM_ID/capture>
    This will return a json with captured image id and url

    Disconnect a stream <http://localhost:8000/api/streams/STREAM_ID/disconnect>


### Containerized

currently, backend and frontend are built in one container

    docker build -t vision .
    docker run -p 8000:8000 vision


### Trouble shooting

If you see the error log like this while doing ```yarn start```
Please increase the inotify amount
<https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers#the-technical-details>
