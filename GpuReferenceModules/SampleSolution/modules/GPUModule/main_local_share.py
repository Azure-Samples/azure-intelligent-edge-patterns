# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import asyncio
#from six.moves import input
import datetime
#import threading
import os.path
from os import path
#from azure.iot.device import Message
#from azure.iot.device.aio import IoTHubModuleClient
#from utility import benchmark_tf

async def parse():
    print("File exists:"+str(path.exists('/app/data/mytest.txt')))
    print("File exists:"+str(path.exists('/app/data/mysharetest.txt')))

if __name__ == "__main__":

    loop = asyncio.get_event_loop()
    loop.run_until_complete(parse())
    #loop.run_until_complete(main())
    loop.close()

    # If using Python 3.7 or above, you can use following code instead:
    # asyncio.run(main())