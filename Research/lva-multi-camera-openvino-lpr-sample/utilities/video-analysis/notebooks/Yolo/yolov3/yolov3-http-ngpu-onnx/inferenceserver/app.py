import threading
import cv2
import numpy as np
import io
import onnxruntime
import json
import logging
import linecache
import sys
from score import MLModel, PrintGetExceptionDetails
from flask import Flask, request, jsonify, Response

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
inferenceEngine = MLModel()

@app.route("/score", methods = ['POST'])
def scoreRRS():
    global inferenceEngine

    try:
        # get request as byte stream
        reqBody = request.get_data(False)

        # convert from byte stream
        inMemFile = io.BytesIO(reqBody)

        # load a sample image
        inMemFile.seek(0)
        fileBytes = np.asarray(bytearray(inMemFile.read()), dtype=np.uint8)
        cvImage = cv2.imdecode(fileBytes, cv2.IMREAD_COLOR)

        # Infer Image
        detectedObjects = inferenceEngine.Score(cvImage)

        if len(detectedObjects) > 0:
            respBody = {                    
                        "inferences" : detectedObjects
                    }

            respBody = json.dumps(respBody)
            
            logging.info("[AI EXT] Sending response.")
            return Response(respBody, status= 200, mimetype ='application/json')
        else:
            logging.info("[AI EXT] Sending empty response.")
            return Response(status= 204)

    except:
        PrintGetExceptionDetails()
        return Response(response='Exception occured while processing the image.', status=500)
    
@app.route("/")
def healthy():
    return "Healthy"

# About
@app.route('/about', methods = ['GET'])
def about_request():
    global inferenceEngine
    return inferenceEngine.About()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5444)
