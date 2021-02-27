import threading
import cv2
from PIL import Image
import numpy as np
import io
import os
import json
import logging
import linecache
from score import MLModel, PrintGetExceptionDetails
from flask import Flask, request, Response, send_file, make_response
import math
import re
import time
import http.client
import urllib.request
import urllib.parse
import urllib.error
import requests
import io
import json
import base64


def create_video_file(output_path, output_name, fps, width, height):
    path = os.path.join(output_path, output_name)
    codec = cv2.VideoWriter_fourcc(*'DIVX')  # MP4V XVID MPEG DIVX
    if fps < 20:
        fps = 20
    out = cv2.VideoWriter(path, codec, fps, (height, width))
    return out


def create_video_from_single_image(input_path, image_name, output_path, fps=20, duration=20):
    path = os.path.join(input_path, image_name)
    image = cv2.imread(path)
    cv2.imshow('Image', image)
    print("Image format: width = {0}; height = {1}; channels = {2}.".format(image.shape[0], image.shape[1],
                                                                            image.shape[2]))
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    output_name = re.sub(".(jpg|jpeg|png)", ".avi", image_name)
    if duration < 10:
        duration = 10
    out = create_video_file(output_path, output_name, fps, image.shape[0], image.shape[1])
    counter = fps * duration
    for _ in range(counter):
        out.write(image)
    out.release()


def detect_on_frame(cvImage):
    detectedObjects = inferenceEngine.score(cvImage)
    if len(detectedObjects) > 0:
        confidence = 0.2
        results = []
        height, width, channels = cvImage.shape
        for detected in detectedObjects:
            conf = float(detected["entity"]["tag"]["confidence"])
            if conf > confidence:
                results.append(detected)
        for result in results:
            bbox = result['entity']['box']
            left = float(bbox['l'])
            top = float(bbox['t'])
            bbox_width = float(bbox['w'])
            bbox_height = float(bbox['h'])
            left = math.ceil(left * width)
            top = math.ceil(top * height)
            bbox_width = math.ceil(float(bbox['w']) * width)
            bbox_height = math.ceil(float(bbox['h']) * height)
            bottom = top + bbox_height
            right = left + bbox_width
            color = (255, 0, 0)  # Blue in BGR
            top_left = (left, top)
            bottom_right = (right, bottom)
            thickness = 2
            cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)
    return cvImage


def car_detection_on_frame(cvImage):
    output_path = "/home/visionadmin/source/cropped_license_plates"
    detectedObjects = inferenceEngine.score(cvImage)
    if len(detectedObjects) > 0:
        confidence = 0.3
        results = []
        height, width, channels = cvImage.shape
        for detected in detectedObjects:
            label = float(detected["entity"]["tag"]["value"])
            if label == 1.0: # 1.0=Car; 2.0=Licence plate
                conf = float(detected["entity"]["tag"]["confidence"])
                if conf > confidence:
                    results.append(detected)
        for result in results:
            bbox = result['entity']['box']
            left = float(bbox['l'])
            top = float(bbox['t'])
            bbox_width = float(bbox['w'])
            bbox_height = float(bbox['h'])
            left = math.ceil(left * width)
            top = math.ceil(top * height)
            bbox_width = math.ceil(float(bbox['w']) * width)
            bbox_height = math.ceil(float(bbox['h']) * height)
            bottom = top + bbox_height
            right = left + bbox_width
            color = (255, 0, 0)  # Blue in BGR
            top_left = (left, top)
            bottom_right = (right, bottom)
            thickness = 2
            cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)
    return cvImage


def license_plate_detection_on_frame(cvImage):
    output_path = "/home/visionadmin/source/cropped_license_plates"
    detectedObjects = inferenceEngine.score(cvImage)
    if len(detectedObjects) > 0:
        confidence = 0.9
        results = []
        height, width, channels = cvImage.shape
        for detected in detectedObjects:
            label = float(detected["entity"]["tag"]["value"])
            if label == 2.0: # 1.0=Car; 2.0=Licence plate
                conf = float(detected["entity"]["tag"]["confidence"])
                if conf > confidence:
                    results.append(detected)
        for result in results:
            bbox = result['entity']['box']
            left = float(bbox['l'])
            top = float(bbox['t'])
            bbox_width = float(bbox['w'])
            bbox_height = float(bbox['h'])
            left = math.ceil(left * width)
            top = math.ceil(top * height)
            bbox_width = math.ceil(float(bbox['w']) * width)
            bbox_height = math.ceil(float(bbox['h']) * height)
            bottom = top + bbox_height
            right = left + bbox_width
            color = (255, 0, 0)  # Blue in BGR
            top_left = (left, top)
            bottom_right = (right, bottom)
            thickness = 2
            cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)
            crop_image = cvImage[top:bottom, left:right]
            if crop_image.size > 0:
                file_name = "crop_" + str(top) + "_" + str(left) + ".jpg"
                output = os.path.join(output_path, file_name)
                cv2.imwrite(output, crop_image)
    return cvImage


def openvino_license_plate_recognition_on_frame(cvImage):
    output_path = "/home/visionadmin/source/cropped_license_plates"
    detectedObjects = inferenceEngine.score(cvImage)
    if len(detectedObjects) > 0:
        confidence = 0.9
        results = []
        height, width, channels = cvImage.shape
        for detected in detectedObjects:
            label = float(detected["entity"]["tag"]["value"])
            if label == 2.0: # 1.0=Car; 2.0=Licence plate
                conf = float(detected["entity"]["tag"]["confidence"])
                if conf > confidence:
                    results.append(detected)
        recogEngine = MLModel(modelName=RECOGNITION_MODEL_NAME,
                            modelPrecision=IS_MODEL_PRECISION, 
                            targetDev=IS_TARGET_DEVICE)
        for result in results:
            bbox = result['entity']['box']
            left = float(bbox['l'])
            top = float(bbox['t'])
            bbox_width = float(bbox['w'])
            bbox_height = float(bbox['h'])
            left = math.ceil(left * width)
            top = math.ceil(top * height)
            bbox_width = math.ceil(float(bbox['w']) * width)
            bbox_height = math.ceil(float(bbox['h']) * height)
            bottom = top + bbox_height
            right = left + bbox_width
            color = (255, 0, 0)  # Blue in BGR
            top_left = (left, top)
            bottom_right = (right, bottom)
            thickness = 2
            cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)
            crop_image = cvImage[top:bottom, left:right]
            if crop_image.size > 0:
                file_name = "crop_" + str(top) + "_" + str(left) + ".jpg"
                output = os.path.join(output_path, file_name)
                cv2.imwrite(output, crop_image)
                h, w, c = crop_image.shape
                crop_image = np.reshape(crop_image, (c, h, w))
                plates = recogEngine.score(crop_image)
                scored = []
                for plate in plates:
                    conf = float(detected["entity"]["tag"]["confidence"])
                    if conf > 0.2:
                        scored.append(plate)
    detectedObjects = inferenceEngine.score(cvImage)
    return cvImage


def openvino_cognitiveservices_license_plate_recognition_on_frame(cvImage):
    output_path = "/home/visionadmin/source/cropped_license_plates"
    headers = {
        'Content-Type': 'application/octet-stream', #  multipart/form-data
        'Ocp-Apim-Subscription-Key': '8c043398bc204c7eb1ec930a93ff0897'
    }
    detectedObjects = inferenceEngine.score(cvImage)
    if len(detectedObjects) > 0:
        confidence = 0.3
        results = []
        height, width, channels = cvImage.shape
        for detected in detectedObjects:
            label = float(detected["entity"]["tag"]["value"])
            if label == 2.0: # 1.0=Car; 2.0=Licence plate
                conf = float(detected["entity"]["tag"]["confidence"])
                if conf > confidence:
                    results.append(detected)
        for result in results:
            bbox = result['entity']['box']
            left = float(bbox['l'])
            top = float(bbox['t'])
            bbox_width = float(bbox['w'])
            bbox_height = float(bbox['h'])
            left = math.ceil(left * width)
            top = math.ceil(top * height)
            bbox_width = math.ceil(float(bbox['w']) * width)
            bbox_height = math.ceil(float(bbox['h']) * height)
            bottom = top + bbox_height
            right = left + bbox_width
            color = (255, 0, 0)  # Blue in BGR
            top_left = (left, top)
            bottom_right = (right, bottom)
            thickness = 2
            cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)
            crop_image = cvImage[top:bottom, left:right]
            if crop_image.size > 0:
                file_name = "crop_" + str(top) + "_" + str(left) + ".jpg"
                output = os.path.join(output_path, file_name)
                h, w, c = crop_image.shape
                if h < 50:
                    ratio = w / h
                    new_h = 60
                    new_w = math.ceil(new_h * ratio)
                    crop_image = cv2.resize(crop_image, (new_w, new_h), cv2.INTER_AREA)
                cv2.imwrite(output, crop_image)
                try:
                    encoded_image = cv2.imencode(".jpg", crop_image)[1].tobytes()
                    params = {
                        'language': 'unk',
                        'detectOrientation': 'true'
                    }
                    #ocr_endpoint = 'aivisiontests.cognitiveservices.azure.com/'
                    #conn = http.client.HTTPSConnection(ocr_endpoint)
                    #conn.request("POST", "vision/v3.0/ocr?%s" % params, "{body}", headers)
                    #response = conn.getresponse()
                    #data = response.read()
                    #print(data)
                    #conn.close()
                    ocr_url = "https://aivisiontests.cognitiveservices.azure.com/vision/v3.0/ocr"
                    response = requests.post(ocr_url,
                    headers=headers,
                    params=params,
                    data=encoded_image
                    )
                    #print(response.content)
                    content = json.loads(response.content)
                    regions = content["regions"]
                    if regions is not None:
                        for region in regions:
                            lines = region["lines"]
                            text = ""
                            for line in lines:
                                words = line["words"]
                                text = ""
                                for word in words:
                                    bbox = [int(num) for num in word["boundingBox"].split(",")]
                                    text = text + word["text"].upper()
                                    print("Bounding box: {0} {1}".format(bbox[2], bbox[3]))
                                    print("Text: {}".format(text))
                                    origin = (bottom, left - 10)
                            if text is not None:
                                font = cv2.FONT_HERSHEY_SIMPLEX
                                fontScale = 2
                                thickness = 2
                                cvImage = cv2.putText(
                                    cvImage,
                                    text,
                                    origin,
                                    font,
                                    fontScale,
                                    (0, 255, 0),
                                    thickness,
                                    cv2.LINE_AA
                                )
                except Exception as ex:
                    print("Error:", str(ex))                
    return cvImage


def lpr_recognition_from_video(video_path, output_path):
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        print("Error loading video.")
        return
    codec = cv2.VideoWriter_fourcc('M', 'J', 'P', 'G')
    ret, frame = capture.read()
    height, width, _ = frame.shape
    output = cv2.VideoWriter(output_path, codec, 10, (width, height))
    while ret:
        frame = car_detection_on_frame(frame)
        frame = openvino_cognitiveservices_license_plate_recognition_on_frame(frame)
        output.write(frame)
        ret, frame = capture.read()
    capture.release()
    output.release()


def lpr_recognition_from_frame(frame):
    frame = car_detection_on_frame(frame)
    frame = openvino_cognitiveservices_license_plate_recognition_on_frame(frame)
    return frame


# Initial settings of AI model
#IS_MODEL_NAME = "person-vehicle-bike-detection-crossroad-1016" # see MLModel class for full list of models and other possibilities
IS_MODEL_NAME = "vehicle-license-plate-detection-barrier-0106" # see MLModel class for full list of models and other possibilities
RECOGNITION_MODEL_NAME = "license-plate-recognition-barrier-0001"
IS_TARGET_DEVICE = "CPU"
IS_MODEL_PRECISION = "FP32"
MODEL_PRECISION_16 = "FP16"

app = Flask(__name__)
inferenceEngine = MLModel(    modelName=IS_MODEL_NAME, 
                                modelPrecision=IS_MODEL_PRECISION, 
                                targetDev=IS_TARGET_DEVICE, 
                            )


@app.route('/stream/<id>')
def stream(id):
    respBody = ("<html>"
                "<h1>Stream with inference overlays</h1>"
                "<img src=\"/mjpeg/" + id + "\"/>"
                "</html>")
    return Response(respBody, status=200)


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

        #image = request.files['image']
        #image = Image.open(image)
        #image = np.array(image)
        #cvImage = cv2.cvtColor(image, cv2.IMREAD_COLOR)

        if request.args:
            stream = request.args.get('stream')

        try:
            if stream is not None:
                output_img = lpr_recognition_from_frame(cvImage)
                imgBuf = io.BytesIO()
                output_img.save(imgBuf, format='JPEG')
                # post the image with bounding boxes so that it can be viewed as an MJPEG stream
                postData = b'--boundary\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + imgBuf.getvalue() + b'\r\n'
                requests.post('http://127.0.0.1:80/mjpeg_pub/' + stream, data = postData)
        except Exception as ex:
            print('EXCEPTION:', str(ex))
 
        # call scoring function
        detectedObjects = inferenceEngine.score(cvImage)            

        if len(detectedObjects) > 0:
            confidence = 0.3
            results = []
            for detected in detectedObjects:
                conf = float(detected["entity"]["tag"]["confidence"])
                if  conf > confidence:
                    results.append(detected)
            respBody = {                    
                        "inferences" : results # detectedObjects results
                    }
            height, width, channels = cvImage.shape
            for result in results:
                bbox = result['entity']['box']
                left = float(bbox['l'])
                top = float(bbox['t'])
                bbox_width = float(bbox['w'])
                bbox_height = float(bbox['h'])
                left = math.ceil(left * width)
                top = math.ceil(top * height)
                bbox_width = math.ceil(float(bbox['w']) * width)
                bbox_height = math.ceil(float(bbox['h']) * height)
                bottom = top + bbox_height
                right = left + bbox_width
                color = (255, 0, 0) # Blue in BGR
                top_left = (left, top)
                bottom_right = (right, bottom)
                thickness = 2
                #cvImage = cv2.rectangle(cvImage, top_left, bottom_right, color, thickness)

            # Setting response for json or image
            
            logging.info("[AI EXT] Sending response.")
            # Uncomment to return json object with detection results
            respBody = json.dumps(respBody)
            return Response(respBody, status= 200, mimetype ='application/json')
            # Uncomment to return image with detected objects highlighted, in .png format
            #_, buffer = cv2.imencode('.png', cvImage)
            #response = make_response(buffer.tobytes())
            #response.headers['Content-Type'] = 'image/png'
            #return response
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
    return inferenceEngine.about()

if __name__ == "__main__":      
    app.run(host='127.0.0.1', port=5444)
