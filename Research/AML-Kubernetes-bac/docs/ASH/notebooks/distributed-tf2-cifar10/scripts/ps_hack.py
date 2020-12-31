import json
import os


def convert_ps_nodes_to_workers():
    tf_config = json.loads(os.environ['TF_CONFIG'])

    num_workers = len(tf_config['cluster']['worker'])

    tf_config['cluster']['worker'] += tf_config['cluster']['ps']
    if tf_config['task']['type'] == 'ps':
        tf_config['task']['type'] = 'worker'
        tf_config['task']['index'] += num_workers

    os.environ['TF_CONFIG'] = json.dumps(tf_config)
