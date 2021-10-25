import json
import subprocess

import networkx

from . import ovms
from . import voe

#from IPython import embed

# FIXME
ROOT = '/workspace'

# uncomment these for running at local
#ROOT = '/tmp/workspace'
#subprocess.run(['mkdir', '-p', '/tmp/workspace'])
#subprocess.run(['mkdir', '-p', '/tmp/workspace/tmp'])


MODEL_DIR = ROOT
LIB_DIR = ROOT + '/lib'
TMP_DIR = ROOT + '/tmp'


def load_voe_config_from_dict(j):
    voe_config = voe.VoeConfig(**j)
    return voe_config

def load_voe_config_from_json(j):
    voe_config = voe.VoeConfig(**json.loads(j))
    return voe_config

def _get_node_from_graph(node_id, g):
    return g.nodes.get(node_id)['data']

def _get_edge_from_graph(parent_id, node_id, g):
    return g.edges.get((parent_id, node_id))['data']

def process_source(node, voe_config):
    return node.outputs[0].name

def process_openvino_model(node, g):

    model_config = ovms.ModelConfig(
            name=node.name,
            base_path=MODEL_DIR+'/'+node.openvino_model_name
            
    )
    
    if node.inputs[0].metadata['type'] != 'image': raise Exception('Not a model')

    model_config.shape = '('+', '.join(str(n) for n in node.inputs[0].metadata['shape'])+')'
    model_config.layout = ''.join(node.inputs[0].metadata['layout'])


    metadatas = {node.name: {}}

    outputs = []
    for output in node.outputs:
        outputs.append(ovms.PipelineConfigNodeOutput(
            data_item=output.name,
            alias=output.name
        ))

        # FIXME  intel openvino detection model label begin with 1 ...
        # Need to find a better way to embed this policy
        ##########################################################
        if output.metadata['type'] == 'bounding_box':
            output.metadata['labels'] = ['']+output.metadata['labels']
        ##########################################################

        metadatas[node.name][output.name] = output.metadata

    inputs = []
    for input in node.inputs:
        found_parent = False
        for parent_id in g.predecessors(node.node_id):
            parent_node = _get_node_from_graph(parent_id, g)
            edge = _get_edge_from_graph(parent_id, node.node_id, g)
            if input.name == edge.target.input_name:
                found_parent = True

                inputs.append(
                    {input.name: ovms.PipelineConfigNodeInput(
                        node_name=parent_node.name,
                        data_item=edge.source.output_name)
                    }
                )

                break

        if not found_parent: raise Exception('Unfulfilled inputs')

    pipeline_config_node = ovms.PipelineConfigModelNode(
        name=node.name,
        #model_name=node.openvino_model_name,
        model_name=node.name,
        type='DL model',
        inputs=inputs,
        outputs=outputs)

    return model_config, pipeline_config_node, metadatas

def process_customvision_model(node, g):

    model_name = node.download_uri_openvino.split('/')[3][2:]

    #
    # Download Model
    #
    #subprocess.run(['wget', '-O', TMP_DIR+'/model.zip', node.download_uri_openvino])
    #subprocess.run(['unzip', '-o', TMP_DIR+'/model.zip', '-d', TMP_DIR])
    #subprocess.run(['mkdir', '-p', MODEL_DIR+'/'+model_name])
    #subprocess.run(['mkdir', '-p', MODEL_DIR+'/'+model_name+'/1'])
    #subprocess.run(['mv', TMP_DIR+'/model.xml', MODEL_DIR+'/'+model_name+'/1/'+model_name+'.xml'])
    #subprocess.run(['mv', TMP_DIR+'/model.bin', MODEL_DIR+'/'+model_name+'/1/'+model_name+'.bin'])

    if node.inputs[0].metadata['type'] != 'image': raise Exception('Not a model')


    model_configs = [] 
    cv_pre_model_config = ovms.ModelConfig(
            name='cv_pre',
            base_path=MODEL_DIR+'/cv_pre',
            shape='('+', '.join(str(n) for n in node.inputs[0].metadata['shape'])+')',
            layout=''.join(node.inputs[0].metadata['layout'])
    )

    cv_model_config = ovms.ModelConfig(
            name=node.name,
            base_path=MODEL_DIR+'/'+model_name,
            shape='('+', '.join(str(n) for n in node.inputs[0].metadata['shape'])+')',
            #layout=''.join(node.inputs[0].metadata['layout'])
            layout='NCHW'
    )

    cv_post_model_config = ovms.ModelConfig(
            name='cv_post',
            base_path=MODEL_DIR+'/cv_post',
     )

    model_configs = [cv_pre_model_config, cv_model_config, cv_post_model_config]

    
    cv_post_outputs = []
    metadatas = {node.name: {}}
    for output in node.outputs:
        cv_post_outputs.append(ovms.PipelineConfigNodeOutput(
            data_item='PartitionedCall/model/detection_out/concat',
            alias=output.name
        ))

        metadatas[node.name][output.name] = output.metadata

    cv_pre_inputs = []
    for input in node.inputs:
        found_parent = False
        for parent_id in g.predecessors(node.node_id):
            parent_node = _get_node_from_graph(parent_id, g)
            edge = _get_edge_from_graph(parent_id, node.node_id, g)
            if input.name == edge.target.input_name:
                found_parent = True

                cv_pre_inputs.append(
                    {'image': ovms.PipelineConfigNodeInput(
                        node_name=parent_node.name,
                        data_item=edge.source.output_name)
                    }
                )

                break

        if not found_parent: raise Exception('Unfulfilled inputs')

    cv_pre_pipeline_config_node = ovms.PipelineConfigModelNode(
        name='cv_pre',
        model_name='cv_pre',
        type='DL model',
        inputs=cv_pre_inputs,
        outputs=[
            ovms.PipelineConfigNodeOutput(
                data_item='PartitionedCall/model/image_out/mul',
                alias='image')
        ]
    )

    cv_pipeline_config_node = ovms.PipelineConfigModelNode(
        name=node.name,
        model_name=node.name,
        type='DL model',
        inputs=[
            {'data': ovms.PipelineConfigNodeInput(
                node_name='cv_pre',
                data_item='image')},
        ],
        outputs=[
            ovms.PipelineConfigNodeOutput(
                data_item='detected_classes',
                alias='detected_classes'),
            ovms.PipelineConfigNodeOutput(
                data_item='detected_scores',
                alias='detected_scores'),
            ovms.PipelineConfigNodeOutput(
                data_item='detected_boxes',
                alias='detected_boxes'),
        ]
    )

    cv_post_pipeline_config_node = ovms.PipelineConfigModelNode(
        name='cv_post',
        model_name='cv_post',
        type='DL model',
        inputs=[
            {'detected_classes': ovms.PipelineConfigNodeInput(
                node_name=node.name,
                data_item='detected_classes')},
            {'detected_scores': ovms.PipelineConfigNodeInput(
                node_name=node.name,
                data_item='detected_scores')},
            {'detected_boxes': ovms.PipelineConfigNodeInput(
                node_name=node.name,
                data_item='detected_boxes')},
        ],
        outputs=cv_post_outputs,
    )

    pipeline_config_nodes = [cv_pre_pipeline_config_node, cv_pipeline_config_node, cv_post_pipeline_config_node]
    

    return model_configs, pipeline_config_nodes, metadatas


def process_openvino_library(node, g): 

    library_config = ovms.CustomNodeLibraryConfig(
            name=node.name,
            base_path=LIB_DIR+'/'+node.openvino_library_name
    )
            
    outputs = []
    for output in node.outputs:
        outputs.append(ovms.PipelineConfigNodeOutput(
            data_item=output.name,
            alias=output.name
        ))

    inputs = []
    for input in node.inputs:
        found_parent = False
        for parent_id in g.predecessors(node.node_id):
            parent_node = _get_node_from_graph(parent_id, g)
            edge = _get_edge_from_graph(parent_id, node.node_id, g)
            if input.name == edge.target.input_name:
                found_parent = True

                # FIXME
                parent_node_name = parent_node.name
                if parent_node.type == 'customvision_model':
                    parent_node_name = 'cv_post'

                inputs.append(
                    {input.name: ovms.PipelineConfigNodeInput(
                        node_name=parent_node_name,
                        data_item=edge.source.output_name)
                    }
                )

                break

        if not found_parent: raise Exception('Unfulfilled inputs')

    pipeline_config_node = ovms.PipelineConfigCustomNode(
        name=node.name,
        #library_name=node.openvino_library_name,
        library_name=node.name,
        type='custom',
        inputs=inputs,
        outputs=outputs,
        demultiply_count=0,
        params=node.params,
    )

    return library_config, pipeline_config_node

def process_sink(node, g):
    parent_id = next(g.predecessors(node.node_id))
    parent_node = _get_node_from_graph(parent_id, g)
    edge = _get_edge_from_graph(parent_id, node.node_id, g)
    
    ret = {
        node.name: ovms.PipelineConfigOutput(
            node_name=parent_node.name,
            data_item=edge.source.output_name,
        )
    }
    return ret


def voe_config_to_ovms_config(voe_config,
        model_dir=MODEL_DIR,
        lib_dir=LIB_DIR):

    g = networkx.DiGraph()


    for node in voe_config.nodes:
        g.add_node(node.node_id, data=node)

    for edge in voe_config.edges:
        # Add some validation here FIXME
        g.add_edge(
            edge.source.node_id,
            edge.target.node_id,
            data=edge
        )

    ori_metadatas = {}

    model_config_list = []
    library_config_list = []
    pipeline_config = {
        'name': voe_config.name,
        'inputs': [],
        'nodes': [],
        'outputs': []
    }

    #from IPython import embed; embed()
    for node_id in networkx.topological_sort(g):
        node = g.nodes[node_id]['data']
        if node.type == 'source':
            input = process_source(node, g)
            pipeline_config['inputs'].append(input)

        elif node.type == 'openvino_model':
            model_config, pipeline_config_node, _metadatas = process_openvino_model(node, g)
            model_config_list.append({'config': model_config})
            pipeline_config['nodes'].append(pipeline_config_node)
            ori_metadatas.update(_metadatas)

        elif node.type == 'openvino_library':
            library_config, pipeline_config_node = process_openvino_library(node, g)
            library_config_list.append(library_config)
            pipeline_config['nodes'].append(pipeline_config_node)

            # hack FIXME
            if node.name == 'Crop':
                pipeline_config['outputs'].append({
                    'confidences': ovms.PipelineConfigOutput(
                        node_name=node.name,
                        data_item='confidences'
                )})
                pipeline_config['outputs'].append({
                    'coordinates': ovms.PipelineConfigOutput(
                        node_name=node.name,
                        data_item='coordinates'
                )})
                pipeline_config['outputs'].append({
                    'label_ids': ovms.PipelineConfigOutput(
                        node_name=node.name,
                        data_item='label_ids'
                )})

        elif node.type == 'customvision_model':
            model_configs, pipeline_config_nodes, _metadatas = process_customvision_model(node, g)
            for model_config in model_configs:
                model_config_list.append({'config': model_config})
            pipeline_config['nodes'] += pipeline_config_nodes
            ori_metadatas.update(_metadatas)


        elif node.type == 'sink':
            output = process_sink(node, g)
            pipeline_config['outputs'].append(output)
        
        else:
            raise Exception('Unknown Node Type', node.type)
    #import pprint
    #pprint.pprint(model_config_list)  
    #pprint.pprint(pipeline_config) 
    #from IPython import embed; embed()
    ovms_config = ovms.Config(
        model_config_list=model_config_list,
        custom_node_library_config_list=library_config_list,
        pipeline_config_list=[pipeline_config]
    )

    #FIXME
    detection_metadata = None
    for node in ori_metadatas:
        for output_name in ori_metadatas[node]:
            if ori_metadatas[node][output_name]['type'] == 'bounding_box':
                detection_metadata = ori_metadatas[node][output_name]

    metadatas = {} 
    if len(ovms_config.pipeline_config_list) > 0:
        for output in ovms_config.pipeline_config_list[0].outputs:
            for k, v in output.items():
                if v.node_name in ori_metadatas:
                    if v.data_item in ori_metadatas[v.node_name]:
                        metadatas[k] = ori_metadatas[v.node_name][v.data_item]

                # FIXME
                elif v.data_item == 'label_ids' and detection_metadata is not None:
                    metadatas[k] = detection_metadata


    return ovms_config, metadatas

if __name__ == '__main__':
    j = json.load(open('cascade/test/voe_config2.json'))
    voe_config = load_voe_config_from_dict(j)
    c, metadatas = voe_config_to_ovms_config(voe_config)
    #json.dump(c.dict(exclude_none=True), open('cascade/test/ovms_config2.json', 'w+'))
    #import pprint
    #pprint.pprint(c.dict())
    #from IPython import embed; embed()
    print(metadatas)






    
