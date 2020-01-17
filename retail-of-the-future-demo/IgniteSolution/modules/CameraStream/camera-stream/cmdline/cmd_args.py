import os, argparse

def parse_camera_args():
    # construct the argument parse and parse the arguments
    ap = argparse.ArgumentParser()

    ap.add_argument("camera", type=str)
    ap.add_argument("port", type=int, default=50011)
    ap.add_argument("--fast", action="store_true", default=False)
    ap.add_argument("--debug", action="store_true", default=False)
    args = ap.parse_args()
    return args
   