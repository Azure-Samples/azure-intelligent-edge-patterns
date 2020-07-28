from py_util import run_command,run_command_with_tmp_file,merge_dict
import json
from statistics import mean

def resnet50_training_precision(precision):
    prec_dict = { 
        'FP32' : 'fp32',
        'FP16' : 'fp16'
    }
    return prec_dict.get(precision, 'Invalid')

def get_json_result_from_dict(res_dict):
    res_str = json.dumps(res_dict, indent=1)
    #res_json = json.loads(res_str)
    return res_str

def extract_results_from_output_resnet50(res_str, precision):
    res_arr = res_str.split('\n')
    res_arr = res_arr[-8:]
    #print(res_arr)
    run_name = res_arr[0].split(':')[0] + '_' + precision
    res_arr_vals = res_arr[1:]
    resnet_run_res = dict((x.strip(), y.strip()) for x,y in (res_val.split(':') for res_val in res_arr_vals[:6]))
    resnet50_res = {run_name : resnet_run_res}
    return resnet50_res

def extract_results_from_output_resnet50_training(res_str, precision):
    run_name = 'resnet50_training' + '_' + precision
    res_arr = res_str.split('\n')
    res_arr = res_arr[-100:]
    #print(res_arr)
    res_arr = res_arr[-90:]
    extracted_res_vals = []
    for val_str in res_arr:
        if (len(val_str.split(' ')) < 8):
            continue
        extracted_res_val = val_str.split(' ')[7]
        print(extracted_res_val)
        extracted_res_vals.append(extracted_res_val)
        #print(extracted_res_val)
    _extracted_res_vals = extracted_res_vals[:85]
    print(_extracted_res_vals)
    res_vals = [float(i) for i in _extracted_res_vals]
    resnet50_training_res = {run_name : mean(res_vals)}
    return resnet50_training_res

def run_gpu_inference(model, precision='INT8', batchsize=128, inference_res_dict={}):
    workingdir = '//workspace//nvidia-examples//tensorrt//tftrt//examples//image-classification'
    envvars = {'PYTHONPATH': '$PYTHONPATH://workspace//nvidia-examples//tensorrt//tftrt//examples//third_party//models'}
    cmd = './/install_dependencies.sh'.split()
    result = run_command(cmd, workingdir, envvars)
    for line in result:
        print(line)
    #Todo validate command output and confirm install of dependencies succeeded
    
    # resnet50_training classification inference benchmark
    if (model == 'resnet50_training'):
        imagenet_prec = resnet50_training_precision(precision)
        if (imagenet_prec == 'Invalid'):
            return None
        workingdir = '//workspace//nvidia-examples//cnn'
        cmd = 'mpirun --allow-run-as-root -np 1 python -u .//resnet.py --batch_size 256 --num_iter 1000 --precision ' + imagenet_prec + ' --iter_unit batch --layers 50'
        cmd = cmd.split()
        result = run_command(cmd, workingdir)
        res_str = ''
        for line in result:
            print(line)
            res_str += line.decode('ascii')
        #Todo validate command output and collate result
        inference_res_dict = extract_results_from_output_resnet50_training(res_str, precision)
        return inference_res_dict

    # resnet50 image classification inference benchmark (Needs Precision)
    if (model == 'resnet50'):
        workingdir = '//workspace//nvidia-examples//tensorrt//tftrt//examples//image-classification'
        cmd = 'python image_classification.py --model resnet_v1_50 --batch_size 128 --num_iterations 1000 --precision ' + precision  + ' --use_trt --use_synthetic --data_dir . --mode benchmark'
        cmd = cmd.split()
        result = run_command(cmd, workingdir, envvars)
        res_str = ''
        for line in result:
            print(line)
            res_str += line.decode('ascii')
        inference_res_dict = extract_results_from_output_resnet50(res_str, precision)
        return inference_res_dict
    
    #Return None when the model is incorrectly called
    return None

def benchmark_gpu():
    resnet50_training_res_dict = {}
    resnet50_inference_res_dict = {}
    benchmark_res_resnet50_training_FP16_dict = run_gpu_inference('resnet50_training', 'FP16')
    #benchmark_res_resnet50_training_INT8_dict = run_gpu_inference('resnet50_training', 'INT8')
    benchmark_res_resnet50_inference_FP32_dict = run_gpu_inference('resnet50', 'FP32')
    benchmark_res_resnet50_inference_FP16_dict = run_gpu_inference('resnet50', 'FP16')
    benchmark_res_resnet50_inference_INT8_dict = run_gpu_inference('resnet50', 'INT8')

    resnet50_training_res_dict = {**benchmark_res_resnet50_training_FP16_dict}
    resnet50_inference_res_dict = {**benchmark_res_resnet50_inference_FP32_dict, **benchmark_res_resnet50_inference_FP16_dict, **benchmark_res_resnet50_inference_INT8_dict}

    benchmark_res_dict = {**resnet50_training_res_dict, **resnet50_inference_res_dict}
    benchmark_res_json = get_json_result_from_dict(benchmark_res_dict)

    return benchmark_res_json

# Runner <-- Needs to go in main.py
#gpu_perf_res = benchmark_gpu()
#print(gpu_perf_res)
#gpu_perf_res_json = json.loads(gpu_perf_res)
#print(json.dumps(gpu_perf_res_json, indent=1))