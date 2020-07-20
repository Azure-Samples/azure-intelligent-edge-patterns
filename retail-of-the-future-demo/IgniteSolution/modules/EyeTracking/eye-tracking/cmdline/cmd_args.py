import os, argparse

def parse_counter_args():
    # construct the argument parse and parse the arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-p", "--prototxt", default="./mobilenet_ssd/MobileNetSSD_deploy.prototxt",
        help="path to Caffe 'deploy' prototxt file")
    ap.add_argument("-m", "--model", default="./mobilenet_ssd/MobileNetSSD_deploy.caffemodel",
        help="path to Caffe pre-trained model")
    ap.add_argument("-i", "--input", type=str,
        help="path to optional input video file")
    ap.add_argument("-o", "--output", type=str,
        help="path to optional output video file")
    ap.add_argument("-c", "--confidence", type=float, default=0.4,
        help="minimum probability to filter weak detections")
    ap.add_argument("-s", "--skip-frames", type=int, default=30,
        help="# of skip frames between detections")
    ap.add_argument("-r", "--report-count", type=int, default=30,
        help="# of skip frames between reporting count")
    ap.add_argument("--debug", default=False, action='store_true', help="debug mode")

    ap.add_argument("--id", type=str, default=None, help="id of the counter")   
    ap.add_argument("--direction", type=str, default="down", help="Which direction is considered 'in': up, down, left, right")
    ap.add_argument("--visual", default=False, action='store_true', help="display visual feedback")
    ap.add_argument("--detector", default="opencv", type=str, help="opencv or onnx")
    ap.add_argument("--set-count", default=False, action='store_true', help="Set running total to the number specified in received feedback")
    args = ap.parse_args()
    return args

def parse_agg_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", default=1, type=int, help="Reporting interval")
    ap.add_argument("--debug", default=False, action='store_true', help="Attach a debugger")
    ap.add_argument("--flask-debug", default=False, action='store_true', help="Debug flask interface")
    ap.add_argument("--port", default=5001, type=int, help="port to listen on for requests")
    args = ap.parse_args()
    return args
   
def parse_eye_args():
    return parse_agg_args()   