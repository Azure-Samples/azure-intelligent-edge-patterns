import numpy as np
import argparse
import os, time, logging
from messaging.iotmessenger import IoTCountAggregator
import threading

# for HTTP/1.1 support
from werkzeug.serving import WSGIRequestHandler

from iothub_client import IoTHubError

logging.basicConfig(format='%(asctime)s  %(levelname)-10s %(message)s', datefmt="%Y-%m-%d-%H-%M-%S",
    level=logging.INFO)

COUNT_AGG_QUEUE = "inputCountAgg"

# Flask stuff
from flask import Flask, jsonify, request

app = Flask(__name__)

# Counting route
# TODO: not really thread safe
@app.route("/count")
def get_count():
    return jsonify({"count": aggreg.total})

@app.route("/reset")
def send_reset():
    total = request.args.get('count')
    aggreg.send_reset(total)
    return jsonify({"reset": total})

@app.route("/counters")
def get_individual_counts():
    return jsonify({"counters": aggreg.cur_counts})

def init_aggregator():
    '''
    debug_flask - when set to True we don't instantiate iot edge
    '''

    try:
        if args.debug:
            logging.info("Please attach a debugger to port 5678")
            
            import ptvsd
            ptvsd.enable_attach(('0.0.0.0', 5678))
            ptvsd.wait_for_attach()
            ptvsd.break_into_debugger()

        logging.info("Starting up Counting Aggregator...")
        aggreg = IoTCountAggregator(COUNT_AGG_QUEUE, check_every=args.interval, no_iotedge=args.flask_debug)
        
        return aggreg

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return


def start_app():
    # set protocol to 1.1 so we keep the connection open
    WSGIRequestHandler.protocol_version = "HTTP/1.1"

    app.run(debug=False, host="0.0.0.0", port=args.port)

if __name__ == '__main__':
    import cmdline.cmd_args as cmd_args
    args = cmd_args.parse_agg_args()

    aggreg = init_aggregator()

    flask_thread = threading.Thread(target=start_app, daemon=True)
    flask_thread.start()

    # launch the message loop. Messages get enqueued and processessed every "--interval" sec.
    # It appears this needs to happen on the main thread
    aggreg.start_and_listen()
