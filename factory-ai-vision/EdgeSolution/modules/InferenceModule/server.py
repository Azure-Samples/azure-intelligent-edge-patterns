import sys
import os
#sys.path.insert(0, '../lib')

import logging
import json
import threading
import requests

from arguments import ArgumentParser, ArgumentsType
from exception_handler import PrintGetExceptionDetails
from inference_engine import InferenceEngine
from model_wrapper import ONNXRuntimeModelDeploy
from flask import Flask, request, Response

import grpc
import extension_pb2_grpc
from concurrent import futures

# Main thread

onnx = ONNXRuntimeModelDeploy()
app = Flask(__name__)
@app.route('/prediction', methods=['GET'])
def prediction():
    # print(onnx.last_prediction)
    # onnx.last_prediction
    return json.dumps(onnx.last_prediction)


@app.route('/open_cam', methods=['GET'])
def open_cam():
    def post_img():
        headers = {'Content-Type': 'image/jpg'}
        while True:
            if onnx.cam_is_alive == False:
                break
            onnx.lock.acquire()
            b, img = onnx.cam.read()
            onnx.lock.release()
            if b:
                data = cv2.imencode(".jpg", img)[1].tobytes()
                r = requests.post('http://127.0.0.1:5000/predict',
                                  headers=headers, data=data)
            time.sleep(0.02)

    if onnx.cam_is_alive == False:
        onnx.lock.acquire()
        onnx.cam_is_alive = True
        onnx.lock.release()
        threading.Thread(target=post_img).start()
        return 'open camera', 200
    else:
        return 'camera is already opened', 200


@app.route('/close_cam', methods=['GET'])
def close_cam():
    onnx.lock.acquire()
    onnx.cam_is_alive = False
    onnx.lock.release()
    return 'camera closed', 200


@app.route('/metrics', methods=['GET'])
def metrics():
    inference_num = onnx.detection_success_num
    unidentified_num = onnx.detection_unidentified_num
    total = onnx.detection_total
    is_gpu = onnx.is_gpu
    average_inference_time = onnx.average_inference_time
    last_prediction_count = onnx.last_prediction_count
    if total == 0:
        success_rate = 0
    else:
        success_rate = inference_num * 100 / total
    return json.dumps({
        'success_rate': success_rate,
        'inference_num': inference_num,
        'unidentified_num': unidentified_num,
        'is_gpu': is_gpu,
        'average_inference_time': average_inference_time,
        'last_prediction_count': last_prediction_count
    })


@app.route('/update_retrain_parameters')
def update_retrain_parameters():

    confidence_min = request.args.get('confidence_min')
    if not confidence_min:
        return 'missing confidence_min'

    confidence_max = request.args.get('confidence_max')
    if not confidence_max:
        return 'missing confidence_max'

    max_images = request.args.get('max_images')
    if not max_images:
        return 'missing max_images'

    onnx.confidence_min = int(confidence_min) * 0.01
    onnx.confidence_max = int(confidence_max) * 0.01
    onnx.max_images = int(max_images)

    print('[INFO] updaing retrain parameters to')
    print('  conficen_min:', confidence_min)
    print('  conficen_max:', confidence_max)
    print('  max_images  :', max_images)

    return 'ok'


@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    model_dir = request.args.get('model_dir')
    if not model_uri and not model_dir:
        return ('missing model_uri or model_dir')

    print('[INFO] Update Model ...')
    if model_uri:

        print('[INFO] Got Model URI', model_uri)

        if model_uri == onnx.model_uri:
            print('[INFO] Model Uri unchanged')
        else:
            get_file_zip(model_uri, MODEL_DIR)
            onnx.model_uri = model_uri

        onnx.update_model('model')
        print('[INFO] Update Finished ...')

        return 'ok'

    elif model_dir:
        print('[INFO] Got Model DIR', model_dir)
        onnx.update_model(model_dir)
        print('[INFO] Update Finished ...')
        return 'ok'


@app.route('/update_cam')
def update_cam():

    cam_type = request.args.get('cam_type')
    cam_source = request.args.get('cam_source')

    if not cam_type:
        return 'missing cam_type'
    if not cam_source:
        return 'missing cam_source'

    print('updating cam ...')
    print('  cam_type', cam_type)
    print('  cam_source', cam_source)

    aoi = request.args.get('aoi')
    try:
        aoi = json.loads(aoi)
        has_aoi = aoi['useAOI']
        aoi_info = aoi['AOIs']
    except:
        has_aoi = False
        aoi_info = None

    print('  has_aoi', has_aoi)
    print('  aoi_info', aoi_info)

    onnx.update_cam(cam_type, cam_source, has_aoi, aoi_info)

    return 'ok'


@app.route('/update_parts')
def update_parts():
    try:
        print('----Upadate parts----')
        parts = request.args.getlist('parts')
        print('[INFO] Updating parts', parts)
        onnx.parts = parts
        print('[INFO] Updated parts', parts)
    except:
        print('[ERROR] Unknown format', parts)
        # return 'unknown format'

    onnx.update_parts(parts)

    return 'ok'

# @app.route('/update_threshold')
# def update_threshold():
#    print('[WARNING] is depreciated')
#    return 'ok'


@app.route('/update_iothub_parameters')
def update_iothub_parameters():
    is_send = request.args.get('is_send')
    threshold = request.args.get('threshold')
    fpm = request.args.get('fpm')

    if not is_send:
        return 'missing is_send'
    if not threshold:
        return 'missing threshold'
    if not fpm:
        return 'missing fpm'

    is_send = (is_send == 'True')
    threshold = int(threshold) * 0.01
    fpm = int(fpm)

    print('updating iothub parameters ...')
    print('  is_send', is_send)
    print('  threshold', threshold)
    print('  fpm', fpm)

    onnx.update_iothub_parameters(is_send, threshold, fpm)
    return 'ok'


@app.route('/update_prob_threshold')
def update_prob_threshold():
    prob_threshold = request.args.get('prob_threshold')
    if not prob_threshold:
        return 'missing prob_threshold'

    onnx.threshold = int(prob_threshold) * 0.01
    print('[INFO] updaing prob_threshold to')
    print('  prob_threshold:', prob_threshold)

    onnx.lock.acquire()
    onnx.detection_success_num = 0
    onnx.detection_unidentified_num = 0
    onnx.detection_total = 0
    onnx.detections = []
    onnx.lock.release()

    return 'ok'


def Main():
    try:
        # Get application arguments
        ap = ArgumentParser(ArgumentsType.SERVER)

        # Get port number
        grpcServerPort = ap.GetGrpcServerPort()
        logging.info('gRPC server port: {0}'.format(grpcServerPort))

        # create gRPC server and start running
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=3))
        extension_pb2_grpc.add_MediaGraphExtensionServicer_to_server(
            InferenceEngine(onnx), server)
        server.add_insecure_port(f'[::]:{grpcServerPort}')
        server.start()
        server.wait_for_termination()

    except:
        PrintGetExceptionDetails()
        exit(-1)


if __name__ == "__main__":
    logging_level = logging.DEBUG if os.getenv('DEBUG') else logging.INFO

    # Set logging parameters
    logging.basicConfig(
        level=logging_level,
        format='[LVAX] [%(asctime)-15s] [%(threadName)-12.12s] [%(levelname)s]: %(message)s',
        handlers=[
            # logging.FileHandler(LOG_FILE_NAME),     # write in a log file
            logging.StreamHandler(sys.stdout)       # write in stdout
        ]
    )

    # Call Main logic
    Main()
