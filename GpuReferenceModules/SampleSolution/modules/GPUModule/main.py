# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import asyncio
from six.moves import input
import threading
from azure.iot.device import Message
from azure.iot.device.aio import IoTHubModuleClient
from utility import benchmark_tf,benchmark_pt

async def main():
    try:

        if not sys.version >= "3.5.3":
            raise Exception( "The sample requires python 3.5.3+. Current version of Python: %s" % sys.version )
        print ( "IoT Hub Client for Python" )

        # The client object is used to interact with your Azure IoT hub.
        module_client = IoTHubModuleClient.create_from_edge_environment()

        # connect the client.
        await module_client.connect()

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
        listeners = asyncio.gather(input1_listener(module_client))

        print ( "The sample is now waiting for messages. ")

        # Send a custom message to cloud 
        async def SendMsgToCloud(module_client,input_message):
            try :
                print("sending message...")
                input_message=Message(input_message)
                await module_client.send_message_to_output(input_message, "output")
                print("finished sending message...send_message_to_output")
            except Exception :
                print ("Exception in SendMsgToCloud")
                pass
        shape = 5000

        final_cputime = 0
        final_gputime = 0
        warmup = 3
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
        mylisteners = asyncio.gather(SendMsgToCloud(module_client,msg_to_cloud))



        #Running on pytorch 
        for i in range(1,iter):
            final_gputime = benchmark_pt("gpu",shape)
            final_cputime = benchmark_pt("cpu",shape)
            print("Time taken on cpu is :: " + str(final_cputime) + "Time taken on gpu is " + str(final_gputime))
            time.sleep(1)

        msg_to_cloud = "On Pytorch CPU took :: " + str(final_cputime) + " and GPU took :: " + str(final_gputime)
        print(msg_to_cloud)
        # Schedule task for sending message
        mylisteners = asyncio.gather(SendMsgToCloud(module_client,msg_to_cloud))

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