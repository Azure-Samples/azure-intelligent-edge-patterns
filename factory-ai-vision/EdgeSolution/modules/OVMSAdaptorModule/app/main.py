import sys
import logging
from exception_handler import PrintGetExceptionDetails
from inference_server import  InferenceServer
import grpc
import extension_pb2_grpc
from concurrent import futures
import argparse
import os

# Main thread
def Main():
    try:
        # Get application arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('-p', nargs=1, metavar=('grpc_server_port'),
                                        help='Port number to serve gRPC server.', default=5001)
        parser.add_argument('-b', nargs=1, metavar=('batch_size'),
                                        help='Batch size.', default=1)
    
        _arguments = parser.parse_args()

        # Default to port 5001
        grpcServerPort = _arguments.p

        # Default batch size 1
        batchSize = _arguments.b
        
        # Get port from environment variable (overrides argument)
        envPort = os.getenv('port')

        if(envPort is not None):
            grpcServerPort = envPort
       
        logging.info('gRPC server port with: {0}'.format(grpcServerPort))

        # create gRPC server and start running
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=3))
        extension_pb2_grpc.add_MediaGraphExtensionServicer_to_server(InferenceServer(batchSize), server)
        server.add_insecure_port(f'[::]:{grpcServerPort}')
        server.start()
        server.wait_for_termination()

    except:
        PrintGetExceptionDetails()
        exit(-1)

if __name__ == "__main__": 
    # Set logging parameters
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)-15s] [%(threadName)-12.12s] [%(levelname)s]: %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)       # write in stdout
        ]
    )

    # Call Main function
    Main()