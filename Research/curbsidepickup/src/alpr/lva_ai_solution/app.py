from flask import Flask, request, Response
from PIL import Image
import logging
import json
import io
from score import AnalyticsAPI

app = Flask(__name__)
analyticsAPI = AnalyticsAPI(workDir=".")

@app.route("/score", methods = ['POST'])
def scoreRRS():
    global analyticsAPI
    #analyticsAPI.logger.info("[AI EXT] Received scoring request. Header: {0}".format(json.dumps(dict(request.headers))))

    try:    
        if request.headers['Content-Type'] != 'image/jpeg':
            analyticsAPI.logger.info("[AI EXT] Non JPEG content sent. Exiting the scoring event...")
            return Response(json.dumps({}), status= 415, mimetype ='application/json')

        # get request as byte stream
        reqBody = request.get_data(False)

        # get stream name (optional parameter) for pushing through MJPEG stream.
        stream = request.args.get('stream')

        # convert from byte stream
        inMemFile = io.BytesIO(reqBody)

        # load a sample image
        pilImage = Image.open(inMemFile)

        # call scoring function
        result = analyticsAPI.score(pilImage, stream)

        analyticsAPI.logger.info("[AI EXT] Sending response.")
        return Response(result, status= 200, mimetype ='application/json')

    except Exception as e:
        analyticsAPI.logger.info("[AI EXT] Exception (scoreRRS): {0}".format(str(e)))
        return Response(json.dumps({}), status= 200, mimetype ='application/json')   
    
@app.route("/")
def healthy():
    return "Healthy"

# Version
@app.route('/version', methods = ['GET'])
def version_request():
    global analyticsAPI
    return analyticsAPI.version()

# About
@app.route('/about', methods = ['GET'])
def about_request():
    global analyticsAPI
    return analyticsAPI.about()

# Stream MJPEG
@app.route('/stream/<id>')
def stream(id):
    respBody = ("<html>"
                "<h1>Stream with inferencing overlays</h1>"
                "<img src=\"/mjpeg/" + id + "\"/>"
                "</html>")

    return Response(respBody, status= 200)

if __name__ == "__main__":
    while not analyticsAPI.initialized:
        logger.info("[AI EXT] Waiting AI module to be initialized. (app.py)")
        time.sleep(1)
        
    app.run(host='0.0.0.0', port=5444)