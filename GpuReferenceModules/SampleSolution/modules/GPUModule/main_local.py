# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import asyncio
from six.moves import input
import datetime
import threading
#from azure.iot.device import Message
#from azure.iot.device.aio import IoTHubModuleClient
from utility import benchmark_tf

async def main():
    try:

        if not sys.version >= "3.5.3":
            raise Exception( "The sample requires python 3.5.3+. Current version of Python: %s" % sys.version )
        print ( "IoT Hub Client for Python" )

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
        #listeners = asyncio.gather(input1_listener(module_client))

        print ( "The sample is now waiting for messages. ")

        shape = 5000
        warmup =5
        iter = warmup + 1 
        for i in range(1,iter):
            #time_gpu = benchmark_tf("gpu",shape)
            #final_gputime = final_gputime + time_gpu
            
            time_cpu = benchmark_tf("cpu",shape)
            final_cputime = datetime.timedelta(final_cputime) + time_cpu
            #msg = "Time taken on cpu is :: " + time_cpu + "Time taken on gpu is " + time_gpu
            # Schedule task for sending message
            time.sleep(2)
        #msg_to_cloud = str(iter) + "Iterations Avg. Time taken on cpu is :: " + str(final_cputime/iter) + "and on gpu is " + str(final_gputime/iter)
        print("Time taken on cpu is :: " + str(final_cputime/10) )

        #mylisteners = asyncio.gather(SendMsgToCloud(module_client,msg_to_cloud))
        # Run the stdin listener in the event loop
        loop = asyncio.get_event_loop()
        user_finished = loop.run_in_executor(None, stdin_listener)
       

        # Wait for user to indicate they are done listening for messages
        await user_finished

        # Cancel listening
        #listeners.cancel()


    except Exception as e:
        print ( "Unexpected error %s " % e )
        raise

if __name__ == "__main__":

    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.close()

    # If using Python 3.7 or above, you can use following code instead:
    # asyncio.run(main())