from __future__ import print_function

import horovod.torch as hvd
import socket
import argparse
import pathlib
from azureml.core.run import Run
import numpy as np
import time

print("hostname: ", socket.gethostname(), " host ip: ", socket.gethostbyname(socket.gethostname()))

hvd.init()
print("Mpi rank: ", hvd.rank(), " size: ", hvd.size(), " local rank: ", hvd.local_rank())

parser = argparse.ArgumentParser("train")
parser.add_argument("--training_data", type=str, help="Path to training data")
parser.add_argument("--max_epochs", type=int, help="Max # of epochs for the training")
parser.add_argument("--learning_rate", type=float, help="Learning rate")
parser.add_argument("--model_output", type=str, help="Path of output model")

args = parser.parse_args()

lines = [f'Training data path: {args.training_data}', f'Max epochs: {args.max_epochs}', f'Learning rate: {args.learning_rate}', f'Model output path: {args.model_output}']

pathlib.Path(args.model_output).parent.absolute().mkdir(parents=True, exist_ok=True)
with open(args.model_output, 'w') as file:
    for line in lines:
        print(line)
        file.write(line + "\n")

# Log a few metrics
run = Run.get_context()

for accuracy in np.arange(0.0, 1.0, 0.01):
    run.log('accuracy', accuracy)