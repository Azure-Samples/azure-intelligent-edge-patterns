
import argparse
from datetime import datetime, timedelta
import json
import os
import requests
import sys
import time
import traceback

# Using the grpc client in AzureML Brainwave SDK
from azureml.accel import PredictionClient

# The device connection string to authenticate the device with your IoT hub.
# These environment variables are set in IoT Edge Module settings (see deployment_template.json)
DEVICE_CONNECTION_STRING = os.environ.get("DEVICE_CONNECTION_STRING")
if DEVICE_CONNECTION_STRING:
    # Using the Python Device SDK for IoT Hub:
    #   https://github.com/Azure/azure-iot-sdk-python
    # The sample connects to a device-specific MQTT endpoint on your IoT Hub.
    from iothub_client import IoTHubClient, IoTHubClientError, IoTHubTransportProvider, IoTHubClientResult
    from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError, DeviceMethodReturnValue
    from iothub_service_client import IoTHubDeviceTwin, IoTHubError

    # Using the MQTT protocol.
    PROTOCOL = IoTHubTransportProvider.MQTT
    MESSAGE_TIMEOUT = 10000

def send_confirmation_callback(message, result, user_context):
    print ( "IoT Hub responded to message with status: %s" % (result) )

def send_iothub_message(iothub_client, msg):
    # Send result to IOT hub
    try:
        message = IoTHubMessage(msg)
        iothub_client.send_event_async(message, send_confirmation_callback, None)
    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" ) 

def main(args):
    prediction_client = PredictionClient(args.address, args.port)
    if DEVICE_CONNECTION_STRING and not args.suppress_messages:
        iothub_client = IoTHubClient(DEVICE_CONNECTION_STRING, PROTOCOL)

    while True:
        for image in os.listdir(args.image_dir):
            # score image
            try:
                start_time = time.time()
                results = prediction_client.score_file(path=os.path.join(args.image_dir, image), 
                                                        input_name=args.input_tensors, 
                                                        outputs=args.output_tensors)
                inference_time = (time.time() - start_time) * 1000
                result = 'cat' if results[0] > results[1] else 'dog'
                msg_string = "(%.3f ms) The image %s is a '%s'." % (inference_time, image, result)
                print(msg_string)
            except:
                tb = traceback.format_exc()
                if "StatusCode.UNAVAILABLE" in tb:
                    msg_string = "Unable to inference because AzureML host container is not done flashing the FPGA. If still not available in 5 minutes, check logs of module."
                elif "Object reference not set to an instance of an object" in tb:
                    msg_string = "Unable to inference because the names of the input and output tensors used for scoring are incorrect.\n" + \
                                "Please update the docker CMD arguments to include the correct --input-tensors and --output-tensors parameters."
                else: 
                    msg_string = "Unable to inference for unknown reason. See stack trace below:\n{}".format(tb)
                print(msg_string)
                print("Trying again in {} seconds...".format(args.wait))
            
            if DEVICE_CONNECTION_STRING and not args.suppress_messages:
                send_iothub_message(iothub_client, msg_string)
            time.sleep(args.wait)

if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--image-dir", type=str, default="./assets/", dest='image_dir',
                                    help="The file path of the image to inference. Default: './assets/'")
    parser.add_argument("-i", "--input-tensors", type=str, default="Placeholder:0", dest='input_tensors',
                                    help="The name of the input tensor you specified when converting your model.\n" + \
                                         "Default for Brainwave resnet152: 'Placeholder:0'")
    parser.add_argument("-o", "--output-tensors", type=str, default="classifier_output/Softmax:0", dest='output_tensors',
                                    help="The name of the output tensor you specified when converting your model. \n" + \
                                          "Default for Brainwave resnet152: 'classifier_output/Softmax:0'")
    parser.add_argument("-a", "--address", default="azureml-host",
                                    help="The address of the inferencing container. \n" +
                                        "For IOT Edge, this is name of the inferencing host module on the IOT Edge device.\n" +
                                        "Default: azureml-host")
    parser.add_argument("-p", "--port", default=50051,
                        help="The port of the inferencing container. \n" +
                             "Default: 50051.")
    parser.add_argument("-w", "--wait", default=10, type=int,
                        help="Time to wait between each inference call. \n" +
                             "Default: 10.")
    parser.add_argument("-s", "--suppress-messages", action='store_true', dest='suppress_messages',
                        help="Flag to suppress IOT Hub messages. Default: False.\n" + \
                             "Use --wait flag to lessen or this flag to turn off IOT hub messaging to avoid reaching your limit of IOT Hub messages.")
    args = parser.parse_args()
    main(args)