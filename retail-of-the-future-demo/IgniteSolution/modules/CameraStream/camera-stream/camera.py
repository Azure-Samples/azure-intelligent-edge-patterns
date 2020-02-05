import cv2
import os, logging, time, json
import requests, base64
from flask import Flask, jsonify, request, Response
import numpy as np

# for HTTP/1.1 support
from werkzeug.serving import WSGIRequestHandler

app = Flask(__name__)

logging.basicConfig(format='%(asctime)s  %(levelname)-10s %(message)s', datefmt="%Y-%m-%d-%H-%M-%S",
    level=logging.INFO)

def main():
    pass

def grab_image_from_stream():

    repeat = 3
    wait = 3
    frame = None

    for _ in range(repeat):

        try:
            video_capture = cv2.VideoCapture(args.camera)
            video_capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            frame = video_capture.read()[1]
            break
        except:
            # try to re-capture the stream
            logging.info("Could not capture video. Recapturing and retrying...")
            time.sleep(wait)

    if frame is None:               
        logging.info("Failed to capture frame, sending blank image")
        frame = np.zeros((300, 300, 3))

    return frame

@app.route('/image/700')
def video_image():

    frame = grab_image_from_stream()
    _, jpeg = cv2.imencode('.jpg', frame)
    response = Response(jpeg.tobytes(), headers={"content-length": len(jpeg)}, mimetype="image/jpeg")
    return response

@app.route('/image/800')
def video_image_and_inference():
    frame = grab_image_from_stream()
    frame = cv2.resize(frame, (300, 300))

    _, jpeg = cv2.imencode('.jpg', frame)
    resp_img = jpeg.tobytes()

    scoring_url = "http://grocerymodel:5001/score"
    json_img = json.dumps({"img": frame.tolist()})
    input_data = json_img
    headers = {'Content-Type':'application/json'}
    resp = requests.post(scoring_url, input_data, headers=headers)
    logging.info(f'received response: {resp.status_code}')
    resp_json = json.loads(resp.content)

    resp_json["img"] = str(base64.b64encode(resp_img), "utf-8")

    return jsonify(resp_json)

def start_app():
    # set protocol to 1.1 so we keep the connection open
    WSGIRequestHandler.protocol_version = "HTTP/1.1"

    if args.fast:
        logging.info("Running the `fast` version")

        app.run(host="0.0.0.0", port=args.port)
    else:
        logging.info(f"Staring regular inventory cam. Port: {args.port}")
        app.run(debug=False)

if __name__ == "__main__":
    from cmdline import cmd_args

    args = cmd_args.parse_camera_args()

    if not args.fast:
        app.config['SERVER_NAME'] = f'inventorycam:{args.port}'

    if args.debug:
        logging.info("Please attach a debugger to port 5678")
        
        import ptvsd
        ptvsd.enable_attach(('0.0.0.0', 5681))
        ptvsd.wait_for_attach()
        ptvsd.break_into_debugger()


    start_app()
