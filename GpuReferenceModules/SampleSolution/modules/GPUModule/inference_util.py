from py_util import run_command,run_command_with_tmp_file,merge_dict
import json
from statistics import mean
import os


def resnet50_run_options(precision, batchsize):
    prec_dict = { 
        'FP32' : 'fp32   --use_tf_amp ',
        'FP16' : 'fp16 '
    }
    print('Working on batchsize: ' + batchsize)
    return prec_dict.get(precision, 'Invalid') + '  --batch_size=' + batchsize

def get_json_result_from_dict(res_dict):
    res_str = json.dumps(res_dict, indent=1)
    #res_json = json.loads(res_str)
    return res_str

def import_expected_inference_benchmark_res():
    json_path = '//app//inference_benchmark_reference.json'
    json_file = open(json_path)
    json_str = json_file.read()
    expected_res_json_data = json.loads(json_str)
    print(expected_res_json_data)
    return expected_res_json_data

def extract_results_from_output_resnet50(res_str, precision, batchsize):
    res_arr = res_str.split('\n')
    res_arr = res_arr[-3:]
    print(res_arr)
    run_name = 'resnet50_inference' + '_' + precision + '_' + 'batchsize' + '_' + batchsize
    res_arr_val_str = res_arr[0]
    # resnet_run_res = dict((x.strip(), y.strip()) for x,y in (res_val.split(':') for res_val in res_arr_vals[:6]))
    str_arr = res_arr_val_str.split()
    prev = None
    cur = None
    print(str_arr)
    next_str = ""
    resnet_run_res_dict = {}
    for str in str_arr:
        cur = str
        #print(cur)
        if str == ':':
            next_str = prev + str
        if prev == ':':
            next_str = next_str + str
            next_str_res = next_str.split(':')
            resnet_run_res_dict[next_str_res[0]] = next_str_res[1]
            print(next_str)
        prev = cur
    #print(resnet_run_res_dict)
    resnet50_res = {run_name : resnet_run_res_dict}
    #print(resnet50_res)
    return resnet50_res, run_name

def extract_results_from_output_resnet50_training(res_str, precision, batchsize):
    run_name = 'resnet50_training' + '_' + precision
    res_arr = res_str.split('\n')
    res_arr = res_arr[-2:]
    print(res_arr)
    res_arr = res_arr[0]
    res_val = res_arr[0].split()[-1]
    resnet50_training_res = {run_name : res_val}
    return resnet50_training_res

def clone_benchmark_from_nvidia():
    #ToDo check if the directory already exists
    checkdir = '//app//DeepLearningExamples'
    dirnotexists = os.path.isdir(checkdir)
    if dirnotexists:
        print("Benchmark already exists. Continuing to run...")
        return
    # if it doesn't then clone the inference code
    # Inside the TensorFlow 20.07-tf1-py3 container (I think 20.06 should work too)
    # Pull Deep Learning Examples (which you may already have)
    workingdir = '//app'
    cmd = 'git clone https://github.com/NVIDIA/DeepLearningExamples'.split()
    result = run_command(cmd, workingdir)
    for line in result:
        print(line)

def install_nvidia_dllogger():
    # Install dllogger
    workingdir = '//app'
    cmd = "pip install git+https://github.com/NVIDIA/dllogger".split()
    result = run_command(cmd, workingdir)
    for line in result:
        print(line)

def cleanup_benchmark_dir():
    # Remove DeepLearningExamples benchmark after collecting results
    workingdir = '//app'
    cmd = "rm -rf //app//DeepLearningExamples".split()
    result = run_command(cmd, workingdir)
    for line in result:
        print(line)

def run_gpu_inference(model, precision='FP32', batchsize=256, resnet50_inference_res_dict_expected={}, inference_res_dict={}):
    workingdir = '//app//DeepLearningExamples//TensorFlow//Classification//ConvNets'
    
    # resnet50_training classification inference benchmark
    if (model == 'resnet50_training'):
        resnet50_options = resnet50_run_options(precision, str(batchsize))
        if (resnet50_options.find('Invalid') != -1):
            return None
        cmd = 'python main.py \
  --mode=training_benchmark \
  --iter_unit=batch \
  --num_iter=500 \
  --warmup_steps=20 \
  --use_cosine_lr \
  --label_smoothing 0.1 \
  --lr_init=0.256 \
  --momentum=0.875 \
  --weight_decay=3.0517578125e-05 \
  --use_static_loss_scaling \
  --loss_scale 128 \
  --use_xla \
  --precision=' + resnet50_options
        cmd = cmd.split()
        result = run_command(cmd, workingdir)
        res_str = ''
        for line in result:
            print(line)
            res_str += line.decode('ascii')
        #Todo validate command output and collate result
        inference_res_dict = extract_results_from_output_resnet50_training(res_str, precision, batchsize)
        return inference_res_dict

    # resnet50 image classification inference benchmark (Needs Precision)
    if (model == 'resnet50'):
        resnet50_options = resnet50_run_options(precision, str(batchsize))
        if (resnet50_options.find('Invalid') != -1):
            return None
        cmd = 'python main.py \
  --mode=inference_benchmark \
  --iter_unit=batch \
  --num_iter=500 \
  --warmup_steps=20 \
  --use_xla \
  --precision ' + resnet50_options
        cmd = cmd.split()
        result = run_command(cmd, workingdir)
        res_str = ''
        for line in result:
            print(line)
            res_str += line.decode('ascii')
        inference_res_dict, run_name = extract_results_from_output_resnet50(res_str, precision, str(batchsize))
        #inference_res_dict_with_expected_vals = {k: v for d in [inference_res_dict, resnet50_inference_res_dict_expected] for k, v in d.items()}
        inference_res_dict[run_name].update(resnet50_inference_res_dict_expected[run_name])
        return inference_res_dict
    
    #Return None when the model is incorrectly called
    return None

def inference_benchmark_gpu():
    print("Running Inference Benchmark Perf on GPU...")
    batchsizes = [4, 8, 16, 32, 64, 128, 256]
    resnet50_inference_res_dict = {}
    resnet50_inference_res_dict_expected = import_expected_inference_benchmark_res()
    clone_benchmark_from_nvidia()
    install_nvidia_dllogger()
    for batchsize in batchsizes:
        benchmark_res_resnet50_inference_FP32_dict = run_gpu_inference('resnet50', 'FP32', batchsize, resnet50_inference_res_dict_expected)
        #benchmark_res_resnet50_inference_FP16_dict = run_gpu_inference('resnet50', 'FP16', batchsize)
        resnet50_inference_res_dict = {**resnet50_inference_res_dict, **benchmark_res_resnet50_inference_FP32_dict}

    benchmark_res_dict = {**resnet50_inference_res_dict}
    benchmark_res_json = get_json_result_from_dict(benchmark_res_dict)
    print("Completed Inference Benchmark Perf on GPU.")
    print(benchmark_res_json)
    cleanup_benchmark_dir()

    return benchmark_res_json

def training_benchmark_gpu():
    resnet50_training_res_dict = {}

    clone_benchmark_from_nvidia()
    install_nvidia_dllogger()

    benchmark_res_resnet50_training_FP32_dict = run_gpu_inference('resnet50_training', 'FP32')
    #benchmark_res_resnet50_training_FP16_dict = run_gpu_inference('resnet50_training', 'FP16')

    resnet50_training_res_dict = {**benchmark_res_resnet50_training_FP32_dict, **benchmark_res_resnet50_training_FP16_dict}

    #benchmark_res_dict = {**resnet50_training_res_dict, **resnet50_inference_res_dict}
    benchmark_res_dict = {**resnet50_training_res_dict}
    benchmark_res_json = get_json_result_from_dict(benchmark_res_dict)

    cleanup_benchmark_dir()

    return benchmark_res_json

# Runner <-- To test inference benchmark independently
#gpu_perf_res = inference_benchmark_gpu()
#print(gpu_perf_res)
#gpu_perf_res_json = json.loads(gpu_perf_res)
#print(json.dumps(gpu_perf_res_json, indent=1))