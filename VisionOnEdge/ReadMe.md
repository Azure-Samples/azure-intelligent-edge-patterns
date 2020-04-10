## Backend

#### Install

    pip install -r requirements.txt

#### Initial

    python manage.py makemigrations object_parts cameras
    python manage.py migrate

#### Dev

    python manage.py runserver

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





#### Migrate DB

    python manage.py makemigrations object_parts cameras
    python manage.py migrate

## Front end

    cd ui

#### Initial

    yarn

#### Dev

    yarn start

