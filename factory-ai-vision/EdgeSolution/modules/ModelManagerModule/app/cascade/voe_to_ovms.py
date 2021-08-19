import json
import networkx
from . import ovms
from . import voe

#from IPython import embed

# FIXME
ROOT = '/workspace'

MODEL_DIR = ROOT
LIB_DIR = ROOT + '/lib'

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

    return model_config, pipeline_config_node


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

                inputs.append(
                    {input.name: ovms.PipelineConfigNodeInput(
                        node_name=parent_node.name,
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
            model_config, pipeline_config_node = process_openvino_model(node, g)
            model_config_list.append({'config': model_config})
            pipeline_config['nodes'].append(pipeline_config_node)

        elif node.type == 'openvino_library':
            library_config, pipeline_config_node = process_openvino_library(node, g)
            library_config_list.append(library_config)
            pipeline_config['nodes'].append(pipeline_config_node)

            # hack FIXME
            if node.name == 'crop':
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
    #pprint.pprint(ovms_config)
    #json.dump(ovms_config.dict(), open('config.json', 'w+'), indent=4)
    return ovms_config

if __name__ == '__main__':
    #j = json.load(open('../voe_config.json'))
    j = json.load(open('../wew.json'))
    voe_config = load_voe_config_from_dict(j)
    voe_config_to_ovms_config(voe_config)






    
