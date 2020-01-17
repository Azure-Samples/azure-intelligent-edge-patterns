
import iothub_client
# pylint: disable=E0611
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

import os, time, queue, logging, threading, json
from datetime import datetime

logging.basicConfig(format='%(asctime)s  %(levelname)-10s %(message)s', datefmt="%Y-%m-%d-%H-%M-%S",
    level=logging.INFO)

def send_confirmation_callback(message, result, user_context):
    logging.debug (f"Confirmation: id={user_context} received result = {result}")
    logging.debug (f"Data:  {message.get_string()}" )

def receive_message(message, callback):
    message_buffer = message.get_bytearray()
    size = len(message_buffer)
    message_str = message_buffer[:size].decode('utf-8')
    logging.info(f"Received: {message_str}" )

    callback(message_str)

    # we need to return this or bad things will happen
    return IoTHubMessageDispositionResult.ACCEPTED

class IoTMessaging:
    timeout = 10000

    def __init__(self, input_queue=None, output_queue=None, receive_msg_callback=None):

        self.client = IoTHubModuleClient()
        self.client.create_from_environment(IoTHubTransportProvider.MQTT)

        # set the time until a message times out
        self.client.set_option("messageTimeout", self.timeout)

        self.input_queue = input_queue
        self.output_queue = output_queue

        if self.input_queue is not None:
            self.client.set_message_callback(self.input_queue, receive_message, receive_msg_callback)

    def send_event(self, event, send_context, to_output_queue=True):

        self.client.send_event_async(self.output_queue, event, send_confirmation_callback, send_context)
        
    def send_to_output(self, event, output_name, send_context):
        self.client.send_event_async(output_name, event, send_confirmation_callback, send_context)

class IoTCountMessenger(IoTMessaging):

    def __init__(self, id, counter, prev_count=0, debug=False, debug_no_iot=False):
        '''
        id - id of the counter
        prev_count - how many are there already? (default: 0)
        '''
        self.prev_count = prev_count
        self.id = id
        self.counter = counter
        self.client = None

        if counter is None:
            raise ValueError("Need a valid counting object")

        if debug_no_iot:
            return
        super().__init__(output_queue=f'peopleCount', input_queue=f'feedback', receive_msg_callback=self.receive_feedback)

    def send_count(self):
        if self.client is None:
            return

        total = self.counter.totalCount
        message_str = f"{total},{self.id}"
        message = IoTHubMessage(message_str)

        context = self.id

        self.send_event(message, context)
        logging.info(f"Sent message '{message_str}', context: {context}")
    
    def send_traffic_details(self, walk_in, walk_out, source):
        '''
        Report in/out traffic to the IoT Hub
        Params: 
          walk_in: number of walkings
          walk_out: number of walkouts
          source: prod or test
        '''

        msg = dict()
        msg["id"] = self.id
        msg["in"] = walk_in
        msg["out"] = walk_out
        msg["time"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        msg["title"] = "traffic"
        msg["source"] = source

        msg_text = json.dumps(msg)
        # route message to the iot hub
        self.send_to_output(IoTHubMessage(msg_text), "iotHub", self.id)
        logging.info(f"Traffic: {msg_text}")
        
    def update_count(self, cnt):
        if self.should_reset():
            return
        self.counter.totalCount = cnt

    def receive_feedback(self, message):
        msg, total = message.split(',')
        total = int(total)
        
        logging.info(f"Reset ===== {total}")

        if msg == 'reset' and self.counter is not None:
            logging.info(f"Resetting counter to: ==== {total if self.counter.resets_to_nonzero else 0}")
            self.counter.resetLoop = True
            self.counter.totalCount = total if self.counter.resets_to_nonzero else 0

    def should_reset(self):
        return self.counter.resetLoop

    def reset(self):
        logging.info("Restarting counting loop...")
        total = 0
        if self.should_reset() and self.counter.resets_to_nonzero:
            total = self.counter.totalCount
        
        self.counter.resetLoop = False
        self.counter.totalCount = 0
        return total

class IoTCountAggregator(IoTMessaging):

    def __init__(self, input_queue, check_every=1, no_iotedge=False):

        '''
        Parameters:
            input_queue: IoT hub queue to read message from
            check_every: seconds between checking for now counts
            no_iotedge: for debugging other components, don't instantiate base class
        '''

        # time-based queue. Fresher arrivals get higher priority
        self.messageQueue = queue.PriorityQueue(maxsize=10000)
        
        self.agents = set()
        self.running = True
        self.check_every=check_every
        self.last_checked = 0
        self.total = 0
        self.client = None

        # store current counts for each cameera
        self.cur_counts = dict()

        # don't instantiate the superclass if we want to debug
        # web interface
        if no_iotedge: 
            return

        super().__init__(input_queue=input_queue, output_queue="feedback", receive_msg_callback=self.receive_count)

    def start_and_listen(self):
           
        self.check_queue()

    def receive_count(self, message):

        curTotal, agent_id = message.split(',')
        curTotal = int(curTotal)

        self.agents.add(agent_id)

        curTime = time.time()
        logging.debug(f"Enqueueing -- time: {curTime}, agent {agent_id}, count {curTotal}")

        # we want reverse-priority by time (later is higher priority)
        self.messageQueue.put((-curTime, agent_id, curTotal))
        logging.info(f"Enqueued -- time: {curTime}, agent {agent_id}, count {curTotal}")

    def set_total_and_empty_queue(self):

        if len(self.agents) == 0:
            return

        logging.info("retreiving counts")
        counts = []
        
        self.cur_counts = dict()

        # empty the queue
        # TODO: not thread safe.
        while not self.messageQueue.empty():
            counts += [self.messageQueue.get()]
        
        logging.info(f"retrieved {len(counts)}")
        
        if len(counts) == 0:
            return

        agents = set()
        total = 0
        for (curTime, agent_id, curCount) in counts:
            # if we have seen message from all current agents
            logging.debug("started loop...")

            if len(agents) == len(self.agents):
                break

            # priority queue by time as the first priority.
            # so take the very first entry for each given agent
            if agent_id in agents:
                continue

            agents.add(agent_id)
            logging.info(f"Processing -- time: {curTime} agent: {agent_id} count {curCount}")

            self.cur_counts[agent_id] = curCount
            total += curCount

        self.total = total
        logging.info(f"Running total: {self.total}")

    def check_queue(self):
        while self.running:
            time.sleep(0.8)
            curTime = time.time()
            if self.last_checked + self.check_every >= curTime:
                continue

            logging.debug("About to check the queue...")
            # time to check the queue
            self.set_total_and_empty_queue()
            self.last_checked = time.time()

    def send_reset(self, total):
        if self.client is None:
            return

        message_str = f"reset,{total}"
        message = IoTHubMessage(message_str)

        context = 0

        self.send_event(message, context)
        logging.info(f"Sent RESET message")
