"""Server.
"""
import json
import logging
import os
import time
import sys
import threading
from concurrent import futures

import cv2
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
logger.setLevel(logging.INFO)

ODEL_DIR = 'model'
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = 'nothing'
DETECTION_TYPE_SUCCESS = 'success'
DETECTION_TYPE_UNIDENTIFIED = 'unidentified'
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540

LVA_MODE = 'grpc'

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


@app.route('/metrics', methods=['GET'])
def metrics():
    inference_num = 0
    unidentified_num = 0
    total = 0
    success_rate = 0
    average_inference_time = 0
    last_prediction_count = {}
    is_gpu = onnx.is_gpu
    scenario_metrics = []

    stream_id = request.args.get('cam_id')
    stream = stream_manager.get_stream_by_id_danger(stream_id)
    if stream:
        last_prediction_count = {}
        inference_num = stream.detection_success_num
        unidentified_num = stream.detection_unidentified_num
        total = stream.detection_total
        average_inference_time = stream.average_inference_time
        last_prediction_count = stream.last_prediction_count
        scenario_metrics = stream.get_scenario_metrics()
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
        'last_prediction_count': last_prediction_count,
        'scenario_metrics': scenario_metrics
    })


@app.route('/update_part_detection_id')
def update_part_detection_id():
    return 'ok'


@app.route('/update_retrain_parameters')
def update_retrain_parameters():

    is_retrain = request.args.get('is_retrain')
    if not is_retrain:
        return 'missing is_retrain'

    confidence_min = request.args.get('confidence_min')
    if not confidence_min:
        return 'missing confidence_min'

    confidence_max = request.args.get('confidence_max')
    if not confidence_max:
        return 'missing confidence_max'

    max_images = request.args.get('max_images')
    if not max_images:
        return 'missing max_images'

    # FIXME currently set all streams
    #cam_id = request.args.get('cam_id')
    #s = stream_manager.get_stream_by_id(cam_id)
    is_retrain = (is_retrain == 'True')
    confidence_min = int(confidence_min) * 0.01
    confidence_max = int(confidence_max) * 0.01
    max_images = int(max_images)
    for s in stream_manager.get_streams():
        s.update_retrain_parameters(
            is_retrain, confidence_min, confidence_max, max_images)

    # FIXME will need to show it for different stream
    print('[INFO] updaing retrain parameters to')
    print('  confidecen_min:', confidence_min)
    print('  confidecen_max:', confidence_max)
    print('  max_images  :', max_images)

    return 'ok'


@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    model_dir = request.args.get('model_dir')
    if not model_uri and not model_dir:
        return ('missing model_uri or model_dir')

    print('[INFO] Update Model ...', flush=True)
    if model_uri:

        print('[INFO] Got Model URI', model_uri, flush=True)

        # FIXME webmodule didnt send set detection_mode as Part Detection somtimes.
        # workaround
        onnx.set_detection_mode('PD')
        onnx.set_is_scenario(False)

        if model_uri == onnx.model_uri:
            print('[INFO] Model Uri unchanged', flush=True)
        else:
            get_file_zip(model_uri, MODEL_DIR)
            onnx.model_uri = model_uri

        onnx.update_model('model')
        print('[INFO] Update Finished ...', flush=True)

        return 'ok'

    elif model_dir:
        print('[INFO] Got Model DIR', model_dir)
        onnx.set_is_scenario(True)
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
    n = stream_manager.get_streams_num_danger()
    frame_rate = onnx.update_frame_rate_by_number_of_streams(n)

    for cam in data["cameras"]:
        cam_type = cam['type']
        cam_source = cam['source']
        cam_id = cam['id']
        # TODO: IF onnx.part_detection_mode == "PC" (PartCounting), use lines to count
        line_info = cam.get('lines', None)
        zone_info = cam.get('zones', None)

        if not cam_type:
            return 'missing cam_type'
        if not cam_source:
            return 'missing cam_source'
        if not cam_id:
            return 'missing cam_id'

        if 'aoi' in cam.keys():
            aoi = json.loads(cam['aoi'])
            has_aoi = aoi['useAOI']
            aoi_info = aoi['AOIs']
            print('aoi information', aoi, flush=True)
        else:
            has_aoi = False
            aoi_info = None

        logger.info('updating camera {0}'.format(cam_id))
        s = stream_manager.get_stream_by_id(cam_id)
        #s.update_cam(cam_type, cam_source, cam_id, has_aoi, aoi_info, cam_lines)
        # FIXME has_aoi
        s.update_cam(cam_type, cam_source, frame_rate, cam_id, has_aoi, aoi_info,
                     onnx.detection_mode, line_info, zone_info)

    return 'ok'


@app.route('/update_part_detection_mode')
def update_part_detection_mode():
    """update_part_detection_mode.
    """

    part_detection_mode = request.args.get('part_detection_mode')
    if not part_detection_mode:
        return 'missing part_detection_mode'

    if part_detection_mode not in PART_DETECTION_MODE_CHOICES:
        return 'invalid part_detection_mode'
    onnx.set_detection_mode(part_detection_mode)
    return 'ok'


@app.route('/update_send_video_to_cloud')
def update_send_video_to_cloud():
    """update_part_detection_mode.
    """

    send_video_to_cloud = request.args.get('send_video_to_cloud')
    if not send_video_to_cloud:
        return 'missing send_video_to_cloud'

    if send_video_to_cloud in ['False', 'false']:
        send_video_to_cloud = False
    elif send_video_to_cloud in ['True', 'true']:
        send_video_to_cloud = True
    else:
        return 'unknown send_video_to_cloud params'

    # TODO: Change something here
    onnx.send_video_to_cloud = send_video_to_cloud
    # for s in stream_manager.get_streams():
    #     s.model.send_video_to_cloud = send_video_to_cloud
    return 'ok'


@app.route('/update_parts')
def update_parts():
    try:
        print('----Upadate parts----', flush=True)
        parts = request.args.getlist('parts')
        print('[INFO] Updating parts', parts, flush=True)
        onnx.parts = parts
        print('[INFO] Updated parts', parts, flush=True)
    except:
        print('[ERROR] Unknown format', parts, flush=True)
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

    print('[INFO] updating iothub parameters ...', flush=True)
    print('[INFO]   is_send', is_send, flush=True)
    print('[INFO]   threshold', threshold, flush=True)
    print('[INFO]   fpm', fpm, flush=True)

    # FIXME currently set all streams
    #cam_id = request.args.get('cam_id')
    #s = stream_manager.get_stream_by_id(cam_id)
    for s in stream_manager.get_streams():
        s.update_iothub_parameters(is_send, threshold, fpm)
    return 'ok'


@app.route('/status')
def get_scenario():
    streams_status = []
    for s in stream_manager.get_streams():
        streams_status.append({
            'cam_id': s.cam_id,
            'stream_id': s.cam_id,
            'cam_source': s.cam_source,
            'cam_is_alive': s.cam_is_alive,
            'confidence_min': s.confidence_min,
            'confidence_max': s.confidence_max,
            'max_images': s.max_images,
            'threshold': s.threshold,
            'has_aoi': s.has_aoi,
            'is_retrain': s.is_retrain,
        })
    return json.dumps({
        'num_streams': len(stream_manager.streams),
        'stream_ids': list(stream_manager.streams.keys()),
        'streams_status': streams_status,
        'parts': onnx.parts,
        'scenario': onnx.detection_mode
    })


@app.route('/update_prob_threshold')
def update_prob_threshold():
    prob_threshold = request.args.get('prob_threshold')
    if not prob_threshold:
        return 'missing prob_threshold'

    print('[INFO] updaing prob_threshold to')
    print('  prob_threshold:', prob_threshold)

    for s in stream_manager.get_streams():
        s.threshold = int(prob_threshold) * 0.01
        print('[INFO] Updating', s, 'threshold to', s.threshold, flush=True)
        #s.detection_success_num = 0
        #s.detection_unidentified_num = 0
        #s.detection_total = 0
        #s.detections = []
        s.reset_metrics()

    return 'ok'


def init_topology():

    instances = gm.invoke_graph_instance_list()
    if instances['status'] != 200:
        logger.warning('Failed to invoker direct method', instances['payload'])
        return -1
    logger.info('========== Deleting {0} instance(s) =========='.format(
        len(instances['payload']['value'])))

    for i in range(len(instances['payload']['value'])):
        gm.invoke_graph_instance_deactivate(
            instances['payload']['value'][i]['name'])
        gm.invoke_graph_instance_delete(
            instances['payload']['value'][i]['name'])

    topologies = gm.invoke_graph_topology_list()
    if instances['status'] != 200:
        logger.warning('Failed to invoker direct method', instances['payload'])
        return -1
    logger.info('========== Deleting {0} topology =========='.format(
        len(topologies['payload']['value'])))

    for i in range(len(topologies['payload']['value'])):
        gm.invoke_graph_topology_delete(
            topologies['payload']['value'][i]['name'])

    logger.info('========== Setting default grpc topology =========='.format(
        len(topologies['payload']['value'])))
    ret = gm.invoke_topology_set(LVA_MODE)

    return 1


def Local():
    app.run(host='0.0.0.0', debug=False)


def BenchMark():
    #app.run(host='0.0.0.0', debug=False)
    # s.update_cam(cam_type, cam_source, frame_rate, cam_id, has_aoi, aoi_info,
    SAMPLE_VIDEO = './sample_video/video.mp4'
    SCENARIO1_MODEL = 'scenario_models/1'

    n_threads = 3
    n_images = 100
    print('============= BenchMarking (Begin) ==================', flush=True)
    print('--- Settings ----', flush=True)
    print(n_threads, 'threads', flush=True)
    print(n_images, 'images', flush=True)

    stream_ids = list(str(i) for i in range(n_threads))
    stream_manager.update_streams(stream_ids)
    onnx.set_is_scenario(True)
    onnx.update_model(SCENARIO1_MODEL)
    for s in stream_manager.get_streams():
        s.set_is_benchmark(True)
        s.update_cam('video', SAMPLE_VIDEO, 30, s.cam_id, False, None,
                     'PC', [], [])

    def _f():
        print('--- Thread', threading.current_thread(), 'started---', flush=True)
        t0_t = time.time()
        img = cv2.imread('img.png')
        for i in range(n_images):
            s.predict(img)
        t1_t = time.time()
        print('---- Thread', threading.current_thread(), '----', flush=True)
        print('Processing', n_images, 'images in',
              t1_t-t0_t, 'seconds', flush=True)
        print('  Avg:', (t1_t-t0_t)/n_images*1000, 'ms per image', flush=True)

    threads = []
    for i in range(n_threads):
        threads.append(threading.Thread(target=_f))
    t0 = time.time()
    for i in range(n_threads):
        threads[i].start()
    for i in range(n_threads):
        threads[i].join()
    t1 = time.time()
    # print(t1-t0)
    print('---- Overall ----', flush=True)
    print('Processing', n_images*n_threads,
          'images in', t1-t0, 'seconds', flush=True)
    print('  Avg:', (t1-t0)/(n_images*n_threads)
          * 1000, 'ms per image', flush=True)
    print('============= BenchMarking (End) ==================', flush=True)


def Main():
    try:
        # Get application arguments
        ap = ArgumentParser(ArgumentsType.SERVER)

        # Get port number
        grpcServerPort = ap.GetGrpcServerPort()
        logger.info('gRPC server port: {0}'.format(grpcServerPort))

        # init graph topology & instance
        counter = 0
        while init_topology() == -1:
            if counter == 100:
                logger.critical(
                    'Failed to init topology, please check whether direct method still works')
                exit(-1)
            logger.warning('Failed to init topology, try again 10 secs later')
            time.sleep(10)
            counter += 1

        # create gRPC server and start running
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        extension_pb2_grpc.add_MediaGraphExtensionServicer_to_server(
            InferenceEngine(stream_manager), server)
        server.add_insecure_port(f'[::]:{grpcServerPort}')
        server.start()
        app.run(host='0.0.0.0', debug=False)
        # server.wait_for_termination()

    except:
        PrintGetExceptionDetails()
        raise
        # exit(-1)


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
    # Local()
    # BenchMark()
