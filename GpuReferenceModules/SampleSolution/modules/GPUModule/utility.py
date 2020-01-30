import sys
import numpy as np
import tensorflow as tf
import torch
from datetime import datetime

#device_name = sys.argv[1]  # Choose device from cmd line. Options: gpu or cpu
#shape = (int(sys.argv[2]), int(sys.argv[2]))
def benchmark_tf(device_name="cpu",in_shape=10000):
    shape = (in_shape, in_shape)

    if device_name == "gpu":
        device_name = "/gpu:0"
    else:
        device_name = "/cpu:0"

    with tf.device(device_name):
        random_matrix = tf.random_uniform(shape=shape, minval=0, maxval=1)
        dot_operation = tf.matmul(random_matrix, tf.transpose(random_matrix))
        sum_operation = tf.reduce_sum(dot_operation)

    startTime = datetime.now()
    with tf.Session(config=tf.ConfigProto(log_device_placement=True)) as session:
            result = session.run(sum_operation)
            print(result)
    timetaken = datetime.now() - startTime
    # It can be hard to see the results on the terminal with lots of output -- add some newlines to improve readability.
    print("\n" * 5)
    print("Shape:", shape, "Device:", device_name)
    print(device_name," time taken on :", str(timetaken))
    return timetaken

def benchmark_pt(device_name="cpu",in_shape=10000):
    shape = (in_shape, in_shape)
    timetaken = None
    if device_name == "gpu":
        if(not torch.cuda.is_available()):
            print("Gpu not detected returning ...")
            return 0
        with torch.cuda.device(0):
            startTime = datetime.now()
            random_matrix = torch.FloatTensor(shape).uniform_(0,1)
            dot_operation = random_matrix * random_matrix.t()
            sum_operation = torch.sum(dot_operation)
            timetaken = datetime.now() - startTime
            print(sum_operation)

    elif device_name == "cpu":
        startTime = datetime.now()
        random_matrix = torch.FloatTensor(shape).uniform_(0,1)
        dot_operation = random_matrix * random_matrix.t()
        sum_operation = torch.sum(dot_operation)
        timetaken = datetime.now() - startTime
    print("\n" * 5)
    print("Shape:", shape, "Device:", device_name)
    print(device_name," time taken on :", str(timetaken))
    return timetaken