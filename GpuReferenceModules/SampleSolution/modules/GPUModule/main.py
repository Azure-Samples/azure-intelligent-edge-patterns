# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import asyncio
from six.moves import input
import threading
import random
from azure.iot.device import Message
from azure.iot.device.aio import IoTHubModuleClient
from utility import benchmark_tf,benchmark_pt

import sys

# global counters
RUNEXECUTION_COUNT = 0
TWIN_CALLBACKS = 0
RECEIVED_MESSAGES = 0
SHAPE=7000
WARMUP_ITERATIONS = 3

async def main():
    try:

        if not sys.version >= "3.5.3":
            raise Exception( "The sample requires python 3.5.3+. Current version of Python: %s" % sys.version )
        print ( "IoT Hub Client for Python" )

        # The client object is used to interact with your Azure IoT hub.
        module_client = IoTHubModuleClient.create_from_edge_environment()

        # connect the client.
        await module_client.connect()

        ## update the reported properties
        reported_properties = {"temperature": random.randint(320, 800) / 10}
        print("Setting reported temperature to {}".format(reported_properties["temperature"]))
        await module_client.patch_twin_reported_properties(reported_properties)


        # define behavior for receiving an input message on input1
        async def input1_listener(module_client):
            while True:
                input_message = await module_client.receive_message_on_input("input1")  # blocking call
                print("the data in the message received on input1 was ")
                print(input_message.data)
                print("custom properties are")
                print(input_message.custom_properties)
                print("forwarding mesage to output1")
                await module_client.send_message_to_output(input_message, "output1")

        # twin_patch_listener is invoked when the module twin's desired properties are updated.
        async def twin_patch_listener(module_client):
            global TWIN_CALLBACKS
            global RUNEXECUTION_COUNT
            global WARMUP_ITERATIONS
            global SHAPE
            while True:
                try:
                    data = await module_client.receive_twin_desired_properties_patch()  # blocking call
                    print( "The data in the desired properties patch was: %s" % data)
                    if "RunExecutionCount" in data:
                        RUNEXECUTION_COUNT = data["RunExecutionCount"]
                        print("setting RUNEXECUTION_COUNT to : %d" % RUNEXECUTION_COUNT)
                    if "WarmUpCount" in data:    
                        WARMUP_ITERATIONS = data["WarmUpCount"]
                        print("setting WARMUP_ITERATIONS to : %d" % WARMUP_ITERATIONS)
                    if "Shape" in data:
                        SHAPE = data["Shape"]
                        print("setting SHAPE to : %d" % SHAPE)
                    TWIN_CALLBACKS += 1
                    print ( "Total calls confirmed: %d\n" % TWIN_CALLBACKS )
                    while(RUNEXECUTION_COUNT>0):
                        #Calling the Benchmarking script ..
                        mylisteners = asyncio.gather(ExecuteBenchmark(SHAPE,WARMUP_ITERATIONS))
                        RUNEXECUTION_COUNT = RUNEXECUTION_COUNT - 1

                except Exception as ex:
                    print ( "Unexpected error in twin_patch_listener: %s" % ex )

        # define behavior for halting the application
        def stdin_listener():
            while True:
                try:
                    selection = input("Press Q to quit\n")
                    if selection == "Q" or selection == "q":
                        print("Quitting...")
                        break
                except:
                    time.sleep(10)

        # Schedule task for C2D Listener
        listeners = asyncio.gather(input1_listener(module_client),twin_patch_listener(module_client))

        print ( "The sample is now waiting for messages. ")


                # RunExperiments for specified shape and warmup
        async def ExecuteBenchmark(inshape=5000,inwarmup=3):
            shape = inshape
            final_cputime = 0
            final_gputime = 0
            warmup = inwarmup
            iter = warmup + 1 

            ## Runing on tensorflow 
            # We observved on first iteration GPU does not do very well but after 
            # 3+ iterations it starts working well hence the loop below to run some iteration before we take measurements
            for i in range(1,iter):
                final_gputime = benchmark_tf("gpu",shape)
                final_cputime = benchmark_tf("cpu",shape)
                print("Time taken on cpu is :: " + str(final_cputime) + "Time taken on gpu is " + str(final_gputime))
                time.sleep(1)

            msg_to_cloud = "On Tensorflow CPU took :: " + str(final_cputime) + " and GPU took :: " + str(final_gputime)

            print(msg_to_cloud)
            # Schedule task for sending message
            mylisteners = asyncio.gather(send_msg_to_cloud(module_client,msg_to_cloud))

            #Running on pytorch 
            for i in range(1,iter):
                final_gputime = benchmark_pt("gpu",shape)
                final_cputime = benchmark_pt("cpu",shape)
                print("Time taken on cpu is :: " + str(final_cputime) + "Time taken on gpu is " + str(final_gputime))
                time.sleep(1)

            msg_to_cloud = "On Pytorch CPU took :: " + str(final_cputime) + " and GPU took :: " + str(final_gputime)
            print(msg_to_cloud)
            # Schedule task for sending message
            mylisteners = asyncio.gather(send_msg_to_cloud(module_client,msg_to_cloud))    

        # Send a custom message to cloud 
        async def send_msg_to_cloud(module_client,input_message):
            try :
                print("sending message...")
                input_message=Message(input_message)
                await module_client.send_message_to_output(input_message, "output")
                print("finished sending message...send_message_to_output")
            except Exception :
                print ("Exception in send_msg_to_cloud")
                pass

        #Calling the Benchmarking script ..
        mylisteners = asyncio.gather(ExecuteBenchmark(SHAPE,WARMUP_ITERATIONS))




        # Run the stdin listener in the event loop
        loop = asyncio.get_event_loop()
        user_finished = loop.run_in_executor(None, stdin_listener)
       

        # Wait for user to indicate they are done listening for messages
        await user_finished

        # Cancel listening
        listeners.cancel()
        mylisteners.cancel()

        # Finally, disconnect
        await module_client.disconnect()

    except Exception as e:
        print ( "Unexpected error %s " % e )
        raise

if __name__ == "__main__":

    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.close()

    # If using Python 3.7 or above, you can use following code instead:
    # asyncio.run(main())