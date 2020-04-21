

import sys, os
import onnxruntime
import numpy as np
import cv2
import json
import iot_hub_manager
import time
import datetime

from VideoStream import VideoStream
from object_detection import ObjectDetection
from image_classification import ImageClassification
from iot_hub_manager import IotHubManager
from iothub_client import IoTHubTransportProvider, IoTHubError
from onnxruntime.capi.onnxruntime_pybind11_state import RunOptions

# Adding iot support
# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
IOT_HUB_PROTOCOL = IoTHubTransportProvider.MQTT
iot_hub_manager = IotHubManager(IOT_HUB_PROTOCOL)

class ONNXRuntimeModelDeploy(ObjectDetection, ImageClassification):
    """Object Detection class for ONNX Runtime
    """
    def __init__(self, manifest, tu_flag_=False):
        print("Called init.....!!!! \n")
        # Default system params
        self.video_inp = "cam"
        self.render = 0

        # Application parameters
        self.img_width = 0
        self.img_height = 0
        self.cap_handle = None
        self.vs = None
        self.session = None
        self.source = "./video/video.mp4"

        self.twin_update_flag = tu_flag_
        self.m_parser(manifest)

    def m_parser(self, manifest):
        print("Called m_parser.....!!!! \n")
        m_file = open(manifest)
        data = json.load(m_file)
        if "RenderFlag" in data:
            self.render = int(data["RenderFlag"])
        else:
            self.render = 0

        if "DomainType" in data:
            # cvexport manifest prameters
            self.domain_type = str(data["DomainType"])
            print("Domain Type:", self.domain_type)
        if "InputStream" in data:
            self.video_inp = str(data["InputStream"])
            print("video_inp Type:", self.video_inp)
        if "SourcePath" in data:
            # cechk if not there then pass
            self.source = str(data["SourcePath"])
            print("Source path is :", self.source)
            
        # default anchors
        if str(self.domain_type) == "ObjectDetection":
           objdet = ObjectDetection(data, None)
           self.model_inference(objdet, iot_hub_manager, 1)
        elif str(self.domain_type) == "Classification":
           imgcls = ImageClassification(data)
           self.model_inference(imgcls, iot_hub_manager, 0)
        else:
           print("Error: No matching DomainType: Object Detection/Image Classificaiton \n")
           print("Exiting.....!!!! \n")
           sys.exit(0)

    #def predict(self, preprocessed_image):
    #    inputs = np.array(preprocessed_image, dtype=np.float32)[np.newaxis,:,:,(2,1,0)] # RGB -> BGR
    #    inputs = np.ascontiguousarray(np.rollaxis(inputs, 3, 1))
    #    start = time.time()
    #    outputs = self.session.run(None, {self.input_name: inputs})
    #    end = time.time()
    #    inference_time = end - start
    #    return np.squeeze(outputs).transpose((1,2,0)), inference_time

    def create_video_handle(self,mysource=None):
        web_cam_found = False
        video_path = None
        print("valus of mysource is :: " + mysource)
        if(mysource is None):
            
            for i in range(4):
                if os.path.exists("/dev/video"+str(i)):
                    web_cam_found = True
                    break

            if web_cam_found:
                video_path = "/dev/video"+str(i)
            else:
                print("\n Error: Input Camera device not found/detected")
                print("\n Exisiting inference...")
                sys.exit(0)
        else:
            video_path=mysource
            

        self.vs = VideoStream(video_path).start()

        # Reading widht and height details
        self.img_width = int(self.vs.stream.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.img_height = int(self.vs.stream.get(cv2.CAP_PROP_FRAME_HEIGHT))

    def model_inference(self, obj, iot_hub_manager, pp_flag):
        last_time=time.time()
        # sending source path for handle 
        if(self.source is not None):
            self.create_video_handle(self.source)
        else:
            self.create_video_handle()
        while self.vs.stream.isOpened():
            if iot_hub_manager.setRestartCamera == True:
               iot_hub_manager.setRestartCamera = False
               #self.cap_handle.release()
               obj.session = None
               #RunOptions.terminate = True
               #self.vs.stream.stop()
               #time.sleep(1)
               self.vs.stream.release

               if self.render == 1:
                   cv2.destroyAllWindows()

               if os.path.exists('./model/cvexport.manifest'):
                   print("\n Reading cvexport.config file from model folder")
                   config_filename = "./model/cvexport.manifest"
                   self.__init__(config_filename, True)
                   if(self.source is not None):
                       self.create_video_handle(self.source)
                   else:
                       self.create_video_handle()
               elif os.path.exists("cvexport.manifest"):
                   config_filename = "cvexport.manifest"
                   print("\n Reading cvexport.manifest file from default base folder")
                   self.__init__(config_filename, True)
                   if(self.source is not None):
                       self.create_video_handle(self.source)
                   else:
                        self.create_video_handle()
               else:
                   print("\n ERROR: cvexport.manifest not found check root/model dir")
                   print("\n Exiting inference....")
                   sys.exit(0)
               #iot_hub_manager.restartCamera = False
            
            # Caputre frame-by-frame
            frame = self.vs.read()
            if frame is None:
                print("error no frame returned")
          
            if self.twin_update_flag:
               predictions, infer_time = obj.predict_image(frame)
           
               
               message=None
               # if Object Detection
               if pp_flag:
                  for d in predictions:
                     x = int(d['boundingBox']['left'] * self.img_width)
                     y = int(d['boundingBox']['top'] * self.img_height)
                     w = int(d['boundingBox']['width'] * self.img_width)
                     h = int(d['boundingBox']['height'] * self.img_height)

                     x_end = x+w
                     y_end = y+h

                     start = (x,y)
                     end = (x_end,y_end)
                     
                     if 0.55< d['probability']:
                        print("Detected:: " + str(d['tagName']) + " with probability:: " + str(int(d['probability']*100)) )
                        frame = cv2.rectangle(frame,start,end, (0, 255, 255), 2)

                        out_label = str(d['tagName'])
                        score = str(int(d['probability']*100))
                        print("found label::" + out_label + " with probability::" )
                        cv2.putText(frame, out_label, (x-5, y), cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 255, 0), 2)
                        cv2.putText(frame, score, (x+w-50, y), cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 255, 0), 2)

                        message = { "FPS": format(1.0/infer_time),
                                    "Label": out_label,
                                    "Confidence": score,
                                    "Position": [x, y, x_end, y_end],
                                    "TimeStamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        # Send message to IoT Hub
                        if iot_hub_manager is not None:
                            last_time = iot_hub_manager.send_message_to_upstream(json.dumps(message),last_time)

               else:  #Postprocessing for Classificaton model
                    res = obj.postprocess(predictions)
                    idx = np.argmax(res)

                    frame = cv2.putText(frame, obj.labels[idx], (15, 15), cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 255, 0), 2)
                    message = { "FPS": format(1.0/infer_time),
                                "Label": obj.labels[idx],
                                "TimeStamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                                
                              }

                    # Send message to IoT Hub
                    if iot_hub_manager is not None:
                        last_time = iot_hub_manager.send_message_to_upstream(json.dumps(message),last_time)


               cv2.putText(frame, 'FPS: {}'.format(1.0/infer_time), (10,40), cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 0, 255), 1)

            if self.render == 1:
                # Displaying the image
                cv2.imshow("Inference results", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                   break

        # when everything done, release the capture
        self.vs.__exit__(None, None, None)
        cv2.destroyAllWindows()

def main():

    manifest_file_path = "./model/cvexport.manifest"
    ONNXRuntimeModelDeploy(manifest_file_path)

if __name__ == '__main__':
    main()
