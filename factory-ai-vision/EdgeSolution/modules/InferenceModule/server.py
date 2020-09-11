import json
import logging
import os
import sys
import threading
from concurrent import futures

import grpc
import requests
from flask import Flask, Response, request

import extension_pb2_grpc
from arguments import ArgumentParser, ArgumentsType
from exception_handler import PrintGetExceptionDetails
from inference_engine import InferenceEngine
from invoke import gm
from model_wrapper import ONNXRuntimeModelDeploy
from stream_manager import StreamManager
from utility import get_file_zip, normalize_rtsp
from webmodule_utils import PART_DETECTION_MODE_CHOICES

#sys.path.insert(0, '../lib')

logger = logging.getLogger(__name__)

MODEL_DIR = 'model'
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = 'nothing'
DETECTION_TYPE_SUCCESS = 'success'
DETECTION_TYPE_UNIDENTIFIED = 'unidentified'
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540

# Main thread

onnx = ONNXRuntimeModelDeploy()
stream_manager = StreamManager(onnx)

app = Flask(__name__)


@app.route('/prediction', methods=['GET'])
def prediction():
    # print(onnx.last_prediction)
    # onnx.last_prediction
    cam_id = request.args.get('cam_id')
    s = stream_manager.get_stream_by_id(cam_id)
    return json.dumps(s.last_prediction)


# @app.route('/open_cam', methods=['GET'])
# def open_cam():
#     def post_img():
#         headers = {'Content-Type': 'image/jpg'}
#         while True:
#             if onnx.cam_is_alive == False:
#                 break
#             onnx.lock.acquire()
#             b, img = onnx.cam.read()
#             onnx.lock.release()
#             if b:
#                 data = cv2.imencode(".jpg", img)[1].tobytes()
#                 r = requests.post('http://127.0.0.1:5000/predict',
#                                   headers=headers, data=data)
#             time.sleep(0.02)

#     if onnx.cam_is_alive == False:
#         onnx.lock.acquire()
#         onnx.cam_is_alive = True
#         onnx.lock.release()
#         threading.Thread(target=post_img).start()
#         return 'open camera', 200
#     else:
#         return 'camera is already opened', 200

# @app.route('/close_cam', methods=['GET'])
# def close_cam():
#     onnx.lock.acquire()
#     onnx.cam_is_alive = False
#     onnx.lock.release()
#     return 'camera closed', 200


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

    cam_id = request.args.get('cam_id')
    s = stream_manager.get_stream_by_id(cam_id)
    s.confidence_min = int(confidence_min) * 0.01
    s.confidence_max = int(confidence_max) * 0.01
    s.max_images = int(max_images)

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


@app.route('/update_cams', methods=['POST'])
def update_cams():
    """update_cams.

    Update multiple cameras at once.
    Cameras not in List should not inferecence.
    """
    data = request.get_json()
    logger.info(data["cameras"])
    stream_manager.update_streams(list(cam['id'] for cam in data["cameras"]))
    for cam in data["cameras"]:
        cam_type = cam['type']
        cam_source = cam['source']
        cam_id = cam['id']
        # TODO: IF onnx.part_detection_mode == "PC" (PartCounting), use lines to count
        # cam_id = cam['lines']

        if not cam_type:
            return 'missing cam_type'
        if not cam_source:
            return 'missing cam_source'
        if not cam_id:
            return 'missing cam_id'

        if 'aoi' in cam.keys():
            aoi = json.loads(aoi)
            has_aoi = aoi['useAOI']
            aoi_info = aoi['AOIs']
        else:
            has_aoi = False
            aoi_info = None

        logger.info('updating camera {0}'.format(cam_id))
        s = stream_manager.get_stream_by_id(cam_id)
        s.update_cam(cam_type, cam_source, cam_id, has_aoi, aoi_info)

    return 'ok'


@app.route('/update_part_detection_mode')
def update_part_detection_mode():
    """update_part_detection_mode.
    """

    part_detection_mode = request.args.get('mode')
    if not part_detection_mode:
        return 'missing part_detection_mode'

    if part_detection_mode not in PART_DETECTION_MODE_CHOICES:
        return 'invalid part_detection_mode'
    onnx.detection_mode = part_detection_mode
    return 'ok'


@app.route('/update_send_video_to_cloud')
def update_send_video_to_cloud():
    """update_part_detection_mode.
    """

    send_video_to_cloud = request.args.get('send_video_to_cloud')
    if not send_video_to_cloud:
        return 'missing send_video_to_cloud'

    if send_video_to_cloud not in PART_DETECTION_MODE_CHOICES:
        return 'invalid send_video_to_cloud'
    # TODO: Change something here
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

    cam_id = request.args.get('cam_id')
    s = stream_manager.get_stream_by_id(cam_id)
    s.update_iothub_parameters(is_send, threshold, fpm)
    return 'ok'


@app.route('/update_prob_threshold')
def update_prob_threshold():
    prob_threshold = request.args.get('prob_threshold')
    if not prob_threshold:
        return 'missing prob_threshold'

    onnx.threshold = int(prob_threshold) * 0.01
    print('[INFO] updaing prob_threshold to')
    print('  prob_threshold:', prob_threshold)

    cam_id = request.args.get('cam_id')
    s = stream_manager.get_stream_by_id(cam_id)
    s.lock.acquire()
    s.detection_success_num = 0
    s.detection_unidentified_num = 0
    s.detection_total = 0
    s.detections = []
    s.lock.release()

    return 'ok'


def init_topology():

    instances = gm.invoke_graph_instance_list()
    logger.info('========== Deleting {0} instance(s) =========='.format(
        len(instances['payload']['value'])))

    for i in range(len(instances['payload']['value'])):
        gm.invoke_graph_instance_deactivate(
            instances['payload']['value'][i]['name'])
        gm.invoke_graph_instance_delete(
            instances['payload']['value'][i]['name'])

    topologies = gm.invoke_graph_topology_list()
    logger.info('========== Deleting {0} topology =========='.format(
        len(topologies['payload']['value'])))

    for i in range(len(topologies['payload']['value'])):
        gm.invoke_graph_topology_delete(
            topologies['payload']['value'][i]['name'])

    logger.info('========== Setting default grpc topology =========='.format(
        len(topologies['payload']['value'])))
    ret = gm.invoke_graph_grpc_topology_set()


def Main():
    try:
        # Get application arguments
        ap = ArgumentParser(ArgumentsType.SERVER)

        # Get port number
        grpcServerPort = ap.GetGrpcServerPort()
        logger.info('gRPC server port: {0}'.format(grpcServerPort))

        # init graph topology & instance
        init_topology()

        # create gRPC server and start running
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=3))
        extension_pb2_grpc.add_MediaGraphExtensionServicer_to_server(
            InferenceEngine(stream_manager), server)
        server.add_insecure_port(f'[::]:{grpcServerPort}')
        server.start()
        app.run(host='0.0.0.0', debug=False)
        # server.wait_for_termination()

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
            logging.StreamHandler(sys.stdout)  # write in stdout
        ])

    # Call Main logic
    Main()
