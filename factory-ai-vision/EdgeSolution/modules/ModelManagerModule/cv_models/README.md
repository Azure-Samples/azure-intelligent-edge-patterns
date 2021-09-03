#launch openvino/ubuntu20_dev container
cd /opt/intel/openvino_2021.4.582/deployment_tools/model_optimizer
python3 mo_tf.py --saved_model_dir /workspace/cv_post --output_dir /workspace/cv_post_openvino --disable_nhwc_to_nchw
python3 mo_tf.py --saved_model_dir /workspace/cv_pre --output_dir /workspace/cv_pre_openvino --disable_nhwc_to_nchw
