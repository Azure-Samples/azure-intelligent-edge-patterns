# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import glob
import json
import logging
import os
import shutil
import socket
import subprocess
import subprocess as sp
import sys
import time
import urllib.request as urllib2
import zipfile
from urllib.request import urlopen

import cv2
from azure.iot.device import IoTHubModuleClient

logger = logging.getLogger(__name__)


# this function returns the device ip address if it is apublic ip else 127.0.0.1
def getWlanIp():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(("10.255.255.255", 1))
        IP = s.getsockname()[0]
        if IP.split(".")[0] == "172":
            print("Ip address detected is :: " + IP)
            IP = "172.17.0.1"
            print("Ip address changed to :: " + IP + "to avoid docker interface")
        print("Ip address detected is :: " + IP)

    except:
        IP = "172.17.0.1"
    finally:
        s.close()
    return IP


# this function prepare the camera folder clears any previous models that the device may have
def prepare_folder(folder):
    print("Preparing: %s", folder)
    if os.path.isdir(folder):
        print("Found directory cleaning it before copying new files...")
        # ToDo delete all files in folder
        shutil.rmtree(folder, ignore_errors=True)
        os.makedirs(folder, exist_ok=True)
    else:
        os.makedirs(folder, exist_ok=True)


def WaitForFileDownload(FileName):
    # ----------------------------------------------------
    # Wait until the end of the download
    # ----------------------------------------------------
    valid = 0
    while valid == 0:
        try:
            with open(FileName):
                valid = 1
        except IOError:
            print("Still downloading...", flush=True)
            time.sleep(1)
    print("Got it ! File Download Complete !", flush=True)


def get_file(url, dst_folder="/app/vam_model_folder"):
    # adding code to fix issue where the file name may not be part of url details here
    remotefile = urlopen(url)
    myurl = remotefile.url
    FileName = myurl.split("/")[-1]
    if FileName:
        # find root folders
        dirpath = os.getcwd()
        # src = os.path.join(dirpath,"model")
        dst = os.path.abspath(dst_folder)
        logger.info("Downloading File :: %s", FileName)
        urllib2.urlretrieve(url, filename=(os.path.join(dst, FileName)))
        WaitForFileDownload(os.path.join(dst, FileName))
        return True
    else:
        print("Cannot extract file name from URL")
        return False


def get_file_zip(url, dst_folder="model"):
    # adding code to fix issue where the file name may not be part of url details here
    #
    print("Downloading: %s" % url, flush=True)
    remotefile = urlopen(url)

    myurl = remotefile.url
    FileName = myurl.split("/")[-1]
    print(FileName, flush=True)

    if FileName:
        # find root folders
        dirpath = os.getcwd()
        dirpath_file = os.path.join(dirpath, dst_folder)
        src = os.path.abspath(dirpath_file)
        src_file_path = os.path.join(src, FileName)
        print("Location to download is :: %s" % src_file_path, flush=True)
        prepare_folder(dirpath_file)
        print("Downloading File :: %s" % FileName, flush=True)

        # urllib2.urlretrieve(url, filename=src_file_path)
        subprocess.run(["wget", "-O", src_file_path, url], capture_output=True)
        print("Downloading File :: %s, complete!" % FileName, flush=True)
        print("Unzip and move...", flush=True)
        print(
            "src_file_path: {}, dst_file_path: {}".format(src_file_path, dst_folder),
            flush=True,
        )
        result = unzip_and_move(src_file_path, dst_folder)
        print("Unzip and move... Complete!", flush=True)
        return result
    else:
        print("Cannot extract file name from URL", flush=True)
        return False


def unzip_and_move(file_path=None, dst_folder="model"):
    # print("files unzipped to : %s" % dst_folder, flush=True)
    # zip_ref = zipfile.ZipFile(file_path, "r")
    # print("1", flush=True)
    # dirpath = os.getcwd()
    # print("2", flush=True)
    # dirpath_file = os.path.join(dirpath, dst_folder)
    # print("3", flush=True)
    # zip_ref.extractall(dirpath_file)
    # print("4", flush=True)
    # zip_ref.close()
    # print("files unzipped to : %s, Complete" % dirpath_file, flush=True)
    # transferdlc(True,"twin_provided_model")
    subprocess.run(["unzip", file_path, "-d", dst_folder], capture_output=True)

    return True


# thsi function pushes a new model to device to location /data/misc/camera mounted at /app/vam_model_folder
def transferdlc(pushmodel=None, src_folder="model"):

    # if pushmodel.find("True") == -1 :
    if not pushmodel:
        # checking and transferring model if the devie does not have any tflite or .dlc file on it..
        if checkmodelexist():
            print(
                "Not transferring model as transfer from container is disabled by settting pushmodel to False"
            )
            return
        else:
            print(
                " transferring model as the device does not have any model on it even if pushmodel is set to False"
            )
    else:
        print(
            "transferring model ,label and va config file as set in create option with -p %s passed"
            % pushmodel
        )
    # find root folders
    dirpath = os.getcwd()
    src = os.path.join(dirpath, src_folder)
    dst = os.path.abspath("/app/vam_model_folder")

    # find model files
    vamconfig_file = find_file(src, "va-snpe-engine-library_config.json")
    with open(vamconfig_file) as f:
        vamconfig = json.load(f)

    dlc_file = find_file(src, vamconfig["DLC_NAME"])
    label_file = find_file(src, vamconfig["LABELS_NAME"])
    files = [vamconfig_file, dlc_file, label_file]
    print("Found model files: {} in {}".format(files, src))

    # clean up
    prepare_folder(dst)

    # copy across
    for filename in files:
        print("transfering file :: " + filename)
        shutil.copy(os.path.join(filename), dst)


def checkmodelexist():
    # for file in os.listdir(os.path.abspath("/app/vam_model_folder")):
    # if file.endswith(".dlc") or file.endswith(".tflite"):
    if glob.glob("/app/vam_model_folder/*.dlc"):
        return True
    else:
        print("No dlc or tflit model on device")
        return False


def send_system_cmd(cmd):
    print("Command we are sending is ::" + cmd)
    returnedvalue = sp.call(cmd, shell=True)
    print("returned-value is:" + str(returnedvalue))


# this function will find the required files to be transferred to the device
def find_file(input_path, suffix):
    files = [
        os.path.join(dp, f)
        for dp, dn, filenames in os.walk(input_path)
        for f in filenames
        if f == suffix
    ]
    if len(files) != 1:
        raise ValueError(
            "Expecting a file ending with %s file as input. Found %s in %s. Files: %s"
            % (suffix, len(files), input_path, files)
        )
    return os.path.join(input_path, files[0])


# get the model path from confgiuartion file only used by Azure machine learning service path
def getmodelpath(model_name):
    with open(os.path.join(sys.path[0], "model_config_map.json")) as file:
        data = json.load(file)
    print(data)

    # toDo Change the hardcoded QCOmDlc below with value read
    # print(data['models'][0])
    models = data["models"]
    if len(models.keys()) == 0:
        raise ValueError("no models found")

    if model_name is None:
        # default to the first model
        model_name, model_data = models.popitem()
    else:
        model_data = models[model_name]

    # construct the path
    model_id = model_data["id"]
    print("using model %s" % model_id)
    mydata = model_id.split(":")
    model_path = os.path.join(*mydata)

    return model_path


def normalize_rtsp(rtsp: str) -> str:
    """normalize_rtsp.

    RTSP://xxx => rtsp://

    Args:
        rtsp (str): rtsp

    Returns:
        str: normalized_rtsp
    """
    normalized_rtsp = rtsp
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        normalized_rtsp = "rtsp" + rtsp[4:]
    return normalized_rtsp


# if __name__ == "__main__":
# get_file_zip("https://yadavsrorageaccount01.blob.core.windows.net/visionstoragecontainer/a5719e7549c044fcaf83381a22e3d0b2.VAIDK.zip","twin_provided_model")


def draw_label(img, text, pos, rectangle_color=(255, 255, 255), text_color=(0, 0, 0)):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.3
    thickness = 1
    x, y = pos
    img = cv2.rectangle(
        img, (x, y - 15), (x + len(text) * 5 + 10, y), rectangle_color, -1
    )
    img = cv2.putText(
        img, text, (x + 5, y - 5), font, font_scale, text_color, thickness
    )
    return img


try:
    iot = IoTHubModuleClient.create_from_edge_environment()
except Exception:
    iot = None


def is_edge():
    """is_edge.
    """
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except Exception:
        return False
