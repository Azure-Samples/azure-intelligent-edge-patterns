/**
 * @fileoverview 
 * This file contains methods used when building a Media Graph (used only on page mediagraph.html)
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//media graph building related functions
/**
 * @const GITHUB_TOPOLOGY_SAMPLES - link to raw github where media graph samples exist
 */
const GITHUB_TOPOLOGY_SAMPLES = 'https://raw.githubusercontent.com/Azure/live-video-analytics/master/MediaGraph/topologies/';
var sourceNames = [];
var processorNames = [];
var sinkNames = [];


/**
* creates the JSON object for a graph node and its parameters
* @param {string} nodeType - The type of node to create
* @param {string[]} userSelectedInputs - The list of inputs the user selected for this graph node
* @return {Object} - the json object and parameters for the graph node
*/
function makeGraphNode(nodeType, userSelectedInputs)
{
    //ensure node type exists
    let nodeSchema = getNodeSchema(nodeType);
    if (nodeSchema == undefined)
    {
        throw ("Node type: " + nodeType + " not found");
    }
    let jsonObj =
    {
        "name": nodeType,
        "@type": nodeSchema.type,
    }
    //set inputs
    if (!nodeType.toLowerCase().includes("source"))
    {
        let inputs = [];
        for (let i = 0; i < userSelectedInputs.length; i++)
        {
            if (findObjectByKey(nodeSchema.inputs, "name", userSelectedInputs[i]))
            {
                inputs.push({ "nodeName": userSelectedInputs[i] });
            }
            //redundancy of error checking
            else
            {
                throw ("Input " + userSelectedInputs[i] + " is not accepted by node type " + nodeType);
            }
        }
        jsonObj["inputs"] = inputs;
    }

    //add all extra values (including the variable placeholders like ${rtspUrl})
    for (let i = 0; i < nodeSchema.extraValues.length; i++)
    {
        const item = nodeSchema.extraValues[i];
        jsonObj[item.name] = item.value;
    }

    //we have now constructed the full json object!
    let nodeParameters = nodeSchema.extraParameters;
    return {
        jsonObject: jsonObj,
        nodeParameters: nodeParameters
    }
}


/**
* @param {string} graphname - name of media graph
* @param {string} description - description of media graph
* @param {Object[]} sources - list of source node json objects
* @param {Object[]} processors - list of processor node json objects
* @param {Object[]} sinks - list of sink node json objects
* @param {Object[]} parameters -list of media graph parameters (based on all nodes)
* @return {Object} the json Object representing the Media Graph
*/

function constructMediaGraphJSON(graphname, description = "no description set", sources, processors, sinks, parameters)
{
    return {
        "name": graphname,
        "@apiVersion": "1.0",
        "properties": {
            "description": description,
            "parameters": parameters,
            "sources": sources,
            "processors": processors,
            "sinks": sinks
        }
    };
}

/**
 * find item in list by key (for searching JSON objects)
 * @param {Array} array - array to look through
 * @param {string} key - key to search by
 * @param {string} value - value to look for
 * @returns {any[]} returns found array item if found, otherwise returns undefined
 */
function findObjectByKey(array, key, value)
{
    for (let i = 0; i < array.length; i++)
    {
        if (array[i][key] === value)
        {
            return array[i];
        }
    }
    return undefined;
}

/** 
* get all the valid inputs for a given node type (does this by checking the type's schema)
* @param {jsonObject} schema - the schema object for a given graph node
* @returns {string[]} - array of valid inputs for a node type
*/
function getValidInputs(schema)
{
    let validInputs = [];
    for (let i = 0; i < schema.inputs.length; i++)
    {
        validInputs.push(schema.inputs[i].name);
    }
    return validInputs;
}

/**
* get schema for a give node type using the graphNodeLimitations schema at the bottom of this document
* @param {string} nodeType - the graph node type
* @returns {jsonObject} - schema for given node type
*/
function getNodeSchema(nodeType)
{
    for (let i = 0; i < graphNodeLimitations.length; i++)
    {
        if (graphNodeLimitations[i].name === nodeType)
        {
            return graphNodeLimitations[i];
        }
    }
    return undefined;
}

/**
 * show checkbox options of possible node inputs. Used when building media graph.
 * @param {HTMLUListElement} hoverList - list to add to
 * @param {string} myName - node name 
 * @param {string} listID - source, processor, or sink list id
 * @returns {void}
 */
function setCustomInputs(hoverList, myName, listID)
{
    const allowedInputs = getValidInputs(getNodeSchema(myName));
    if (allowedInputs.length == 0) return;
    let checkBoxNameList = [];
    if (listID == "dynamic-processor" || listID == "dynamic-sink")
    {
        for (index in sourceNames)
        {
            if (allowedInputs.includes(sourceNames[index]))
            {
                checkBoxNameList.push(sourceNames[index]);
            }
        }
        for (index in processorNames)
        {
            if (allowedInputs.includes(processorNames[index]))
            {
                checkBoxNameList.push(processorNames[index]);
            }
        }
    }

    checkBoxNameList.forEach((item) =>
    {
        hoverList.innerHTML += "<li> <input type='checkbox'>" + item + "</li>";
    });

    return;
}

/** 
 * update the list of possible inputs on a given node 
 * @param {HTMLButtonElement} htmlElement - dropdown button clicked on by user
 */
function updateCustomizedInputs(htmlElement)
{
    const hoverList = htmlElement.parentElement.getElementsByTagName("ul")[0];
    hoverList.innerHTML = "";
    const listID = htmlElement.closest(".node-listhead").id;
    const myName = htmlElement.parentElement.parentElement.getAttribute('nodetype');
    setCustomInputs(hoverList, myName, listID);
}

/**
 * returns true if you can add the node type to the graph. 
 * @param {string} nodeType - type of node to add
 * @returns {boolean} - true if node can be added to graph
 */
function canAddToGraph(nodeType)
{
    const neededInputs = getValidInputs(getNodeSchema(nodeType));
    for (let i = 0; i < neededInputs.length; i++)
    {
        if (graphBuilderContains(neededInputs[i]))
        {
            return true;
        }
    }
    alert("You must have at least one of the following node types present before you can add this node: " + neededInputs);
    return false;
}

/**
* if node in list nodeNames doesn't have any valid inputs apart from type, returns false
* @param {string[]} nodeNames - list of existing nodes
* @param {string} type - node to delete
* @returns {boolean} - true if can delete node type from graph builder
*/
function canDeleteHelper(nodeNames, type)
{
    let currentCheck = false;
    for (let i = 0; i < nodeNames.length; i++)
    {
        const neededInputs = getValidInputs(getNodeSchema(nodeNames[i])); //get valid inputs for each node we're looking at
        if (!neededInputs.includes(type)) //if type we want to delete isn't an input for this node, move on
        {
            currentCheck = true;
        }
        else
        {
            neededInputs.splice(neededInputs.indexOf(type), 1); //get rid of node to delete, check if graph contains any other required node
            for (let j = 0; j < neededInputs.length; j++)
            {
                if (graphBuilderContains(neededInputs[j]))
                {
                    currentCheck = true;
                    break;
                }
            }
        }

        if (!currentCheck)
        {
            alert("You cannot delete this node. It is needed for node " + nodeNames[i]);
            return false;
        }
        currentCheck = false;
    }
    return true;
}

/**
 * this method will return false if the node is required as an input for another node
 * @param {string} type - node type to try and delete
 * @returns {boolean} - true if can delete node type from graph builder and type is not rtspSource
 */
function canDeleteFromGraph(type)
{
    if (type == "rtspSource")
    {
        alert("You cannot build a graph without an RTSP Source node!");
        return false;
    }
    // [..array] is a fancy syntax for making a copy of another array but does not reference the same object
    let tempProcessorNames = [...processorNames];
    let ind = tempProcessorNames.indexOf(type);
    if (ind != -1)
    {
        tempProcessorNames.splice(ind, 1);
    }

    let tempSinkNames = [...sinkNames];
    ind = tempSinkNames.indexOf(type);
    if (ind != -1)
    {
        tempSinkNames.splice(ind, 1);
    }
    if (canDeleteHelper(tempProcessorNames, type) && canDeleteHelper(tempSinkNames, type))
    {
        return true;
    }
    return false;
}

/**
 * adds a node to the Media Graph in creation
 * @param {HTMLButtonElement} htmlElement - current htmlElement to add to graph 
 * @param {string} listID - source, processor, or sink 
 * @returns {void}
 */
function addToGraph(htmlElement, listID)
{
    const nodetype = htmlElement.getAttribute('nodetype');
    let template = (listID == 'dynamic-source') ? $('#hidden-template-sourcenode').html() : $('#hidden-template').html();
    template = $(template).clone();

    if (listID != 'dynamic-source' && !canAddToGraph(nodetype))
    {
        return;
    }

    //disable addition of another identical node
    $(htmlElement).attr({ "disabled": true });

    //can only have one or the other, not both
    if (nodetype == "grpcExtension" || nodetype == "httpExtension")
    {
        $('#grpcExtension-dropdown').attr({ 'disabled': true });
        $('#httpExtension-dropdown').attr({ 'disabled': true });
    }

    const newName = htmlElement.name.replace(/_/g, " ");

    let li = template[0];
    let deleteButton = template[0].children[0].children[0];

    //add unique IDs onto htmlElementents. Set close aspect of button
    $(li).closest('label').attr({ 'id': makeUniqueId() });
    $(li).attr({ "id": makeUniqueId(htmlElement.name), "name": newName, "nodetype": nodetype });
    $(deleteButton).html("<span class='close close-button' aria-hidden='true' onclick='deleteGraphNode(this)'>&times;</span>" + newName);

    if (listID == "dynamic-source")
    {
        sourceNames.push(nodetype);
    }
    else if (listID == "dynamic-processor")
    {
        processorNames.push(nodetype);
    }
    else
    {
        sinkNames.push(nodetype);
    }

    if (!listID == 'dynamic-source')
    {
        const hoverList = template[0].getElementsByClassName("dropdown-menu-left")[0];
        setCustomInputs(hoverList, nodetype, listID);
    }

    //Finally, insert finished template into the DOM
    $('#' + listID).append(template);
    return;
}

/**
 * returns if the graph being built contains a node of type type
 * @param {string} type - type of node to look for, i.e. rtspSource, fileSink
 * @returns {boolean} - true if graph builder contains node type
 */
function graphBuilderContains(type)
{
    if (sourceNames.includes(type) || processorNames.includes(type) || sinkNames.includes(type))
    {
        return true;
    }
    return false;
}

/**
 * Delete a graph node from builder as the media graph is being created.
 * @param {HTMLSpanElement} htmlElement - this is the span containing the 'X' on the item to delete
 * @returns {boolean} - returns true if successfully deleted
 */
function deleteGraphNode(htmlElement)
{
    const nodetype = $(htmlElement).closest('li').attr('nodetype');

    if (!canDeleteFromGraph(nodetype))
    {
        return false;
    }

    // re-enable user to add this type of node again
    document.getElementById((nodetype + "-dropdown")).disabled = false;

    //re-enable addition of an external AI module node
    if (nodetype == "grpcExtension" || nodetype == "httpExtension")
    {
        $('#grpcExtension-dropdown').attr({ 'disabled': false });
        $('#httpExtension-dropdown').attr({ 'disabled': false });
    }

    const listID = $(htmlElement).closest('ul').attr('id');

    //delete node from list that builds it!
    switch (listID)
    {
        case 'dynamic-source':
            sourceNames.splice(sourceNames.indexOf(nodetype), 1);
            break;
        case 'dynamic-processor':
            processorNames.splice(processorNames.indexOf(nodetype), 1);
            break;
        case 'dynamic-sink':
            sinkNames.splice(sinkNames.indexOf(nodetype), 1);
            break;
        default:
            break;
    }

    deleteFromParentListItem(htmlElement);
    return true;
}


/**
 * returns all nodes and inputs from a given list, so if nodeList="dynamic-sink" this would return all of the 
 * sink nodes and the user-checked inputs from the graph builder
 * @param {HTMLUListElement} nodeList - list to fetch nodes and inputs from
 * @returns {jsonObject} - nodes and their inputs from a given list
 */
function getListNodesAndInputs(nodeList)
{
    let nodesAndInputs = [];
    for (let procs of nodeList.getElementsByClassName('graphnode'))
    {
        const name = procs.getAttribute('nodetype');
        let checkedInputs = [];
        const checkBoxes = procs.getElementsByTagName('input');

        for (let box of checkBoxes)
        {
            if (box.checked)
            {
                checkedInputs.push((box.parentElement.innerText).replace(/ /g, ''));
            }
        }
        nodesAndInputs.push({ name: name, value: checkedInputs });
    }
    return nodesAndInputs;
}

/**
 * @returns {any[]} - all the sources, processors, sinks, and their inputs built by the user
 */
function getGraphNodesAndInputs()
{
    let allNodeInfo = {};
    allNodeInfo['sourceNodes'] = (getListNodesAndInputs(document.getElementById('dynamic-source')));
    allNodeInfo['processorNodes'] = (getListNodesAndInputs(document.getElementById('dynamic-processor')));
    allNodeInfo['sinkNodes'] = (getListNodesAndInputs(document.getElementById('dynamic-sink')));
    return allNodeInfo;
}

/**
 * validates that the graph built by the user doesn't break any rules
 * @param {any[]} nodesAndInputsList - all nodes and inputs in graph builder
 * @returns {boolean} if graph is valid or not
 */
function validateGraph(nodesAndInputsList)
{
    //all processors and sources must have at least one input
    let referenced = [];
    referenced = referenced.concat(sourceNames);
    referenced = referenced.concat(processorNames);
    if (nodesAndInputsList['sinkNodes'].length == 0)
    {
        alert("You must have at leastone sink node!");
        return false;
    }
    for (nodeCategory in nodesAndInputsList) //check processors and sinks for inputs
    {
        for (let cur = 0; cur < nodesAndInputsList[nodeCategory].length; cur++)
        {
            if (nodeCategory != 'sourceNodes' && nodesAndInputsList[nodeCategory][cur].value.length == 0)
            {
                alert("All processors and sinks must have at least one input. This node has none: " + nodesAndInputsList[nodeCategory][cur].name);
                return false;
            }
            else
            {
                //mark node as having been referenced
                nodesAndInputsList[nodeCategory][cur].value.forEach((inputName) =>
                {
                    let referencedIndex = referenced.indexOf(inputName);
                    if (referencedIndex != -1)
                    {
                        referenced.splice(referencedIndex, 1);
                    }
                })
            }
        }
    }
    if (referenced.length > 0)
    {
        alert("Each node must be referenced by at least one other node. At least this node isn't referenced: " + referenced[0]);
        return false;
    }
    return true;
}

/** 
* create a media graph based off of what the user-built 
* @returns {boolean} - true if successfully created
*/
function createMediaGraph()
{
    const graphname = document.getElementById("graphname");
    const graphDescription = document.getElementById("graph-description");
    if (graphname.value == "")
    {
        alert("Your graph name cannot be empty!");
        return;
    }
    let sources = [];
    let processors = [];
    let sinks = [];
    let parameters = []
    const nodesAndInputs = getGraphNodesAndInputs();

    if (!validateGraph(nodesAndInputs))
    {
        return false;
    }

    for (nodeCategory in nodesAndInputs)
    {
        for (let node = 0; node < nodesAndInputs[nodeCategory].length; node++)
        {
            let tempNode = makeGraphNode(nodesAndInputs[nodeCategory][node].name, nodesAndInputs[nodeCategory][node].value);
            parameters = parameters.concat(tempNode["nodeParameters"]);
            switch (nodeCategory)
            {
                case 'sourceNodes':
                    sources.push(tempNode["jsonObject"]);
                    break;
                case 'processorNodes':
                    processors.push(tempNode["jsonObject"]);
                    break;
                case 'sinkNodes':
                    sinks.push(tempNode["jsonObject"]);
                    break;
            }
        }
    }

    const createdGraph = constructMediaGraphJSON(graphname.value, graphDescription.value, sources, processors, sinks, parameters);

    graphSetTopology(createdGraph);
    document.getElementById("dynamic-source").innerHTML = "Sources: ";
    document.getElementById("dynamic-processor").innerHTML = "Processors: ";
    document.getElementById("dynamic-sink").innerHTML = "Sinks: ";

    //re-enable all buttons
    const resetButtons = document.getElementsByClassName("dropdown-item");
    for (button of resetButtons)
    {
        button.disabled = false;
    }
    graphname.value = "";
    graphDescription.value = "";
    return true;
}

/**
 * This function sets a media graph that is imported from existing github samples
 * @param {HTMLButtonElement} htmlElement - dropdown user clicks containing media graph name
 */
function setMediaGraphFromTemplate(htmlElement)
{
    const jsonLocation = GITHUB_TOPOLOGY_SAMPLES + htmlElement.name + "/topology.json";
    $.getJSON(jsonLocation, function (response)
    {
        graphSetTopology(response);
    })
}

/**
 * Display media graphs on page
 */
function displayMediaGraphs()
{
    const mediaGraphs = Object.keys(graphTopologies);
    let mediaGraphTBody = $('#existing-media-graphs');
    $(mediaGraphTBody)[0].innerHTML = "";

    // for each graph we have show. Ugly element finding, but it does the trick
    mediaGraphs.forEach((graph) =>
    {
        let template = $('#created-graph-template').html();
        template = $(template).clone();
        $(template)[0].setAttribute('id', makeUniqueId());
        let values_column = $(template)[0].getElementsByTagName('td')[0];
        values_column.innerHTML = graph;
        mediaGraphTBody.append(template);
    });
}

/**
 * display existing media graphs by name, on page. Onload function for mediagraph.html
 * chained promises!!!
 */
function displayMediaGraphsOnLoad()
{
    graphEntityList("GraphTopologyList").then(() =>
    {
        displayMediaGraphs();
    }).catch((error) =>
    {
        console.error(error);
    });
}

/**
 * delete's a graph if user clicks delete on a current graph in the Media Graph page
 * @param {HTMLSpanElement} htmlElement - x span user clicked on to delete graph topology
 */
function deleteGraph(htmlElement)
{
    const graphToDelete = htmlElement.parentElement.previousElementSibling.innerText;
    graphEntityModify(graphToDelete, "GraphTopologyDelete", true);
    const id = $(htmlElement).closest('tr').attr('id');
    let tableItem = document.getElementById(id);
    tableItem.parentElement.removeChild(tableItem);
}

/** 
* @constant
* Custom JSON schema of graph node limitations. If anything changes, modify this! 
*/
const graphNodeLimitations =
    [
        {
            "name": "rtspSource",
            "type": "#Microsoft.Media.MediaGraphRtspSource",
            "inputs": [],
            "extraParameters":
                [
                    {
                        "name": "rtspUserName",
                        "type": "String",
                        "description": "rtsp source user name.",
                        "default": "dummyUserName"
                    },
                    {
                        "name": "rtspPassword",
                        "type": "String",
                        "description": "rtsp source password.",
                        "default": "dummyPassword"
                    },
                    {
                        "name": "rtspUrl",
                        "type": "String",
                        "description": "rtsp Url"
                    }
                ],
            "extraValues":
                [
                    {
                        "name": "endpoint",
                        "value":
                        {
                            "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
                            "url": "${rtspUrl}",
                            "credentials": {
                                "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
                                "username": "${rtspUserName}",
                                "password": "${rtspPassword}"
                            }
                        }
                    }
                ]
        },
        {
            "name": "iotMessageSource",
            "type": "#Microsoft.Media.MediaGraphIoTHubMessageSource",
            "inputs": [],
            "extraParameters":
                [
                    {
                        "name": "hubSourceInput",
                        "type": "String",
                        "description": "input name for hub source",
                        "default": "recordingTrigger"
                    }
                ],
            "extraValues":
                [
                    {
                        "name": "hubInputName",
                        "value": "${hubSourceInput}"
                    }
                ]
        },
        {
            "name": "motionDetection",
            "type": "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
            "inputs": [
                {
                    "name": "rtspSource",
                    "required": true
                }
            ],
            "extraParameters": [
                {
                    "name": "motionSensitivity",
                    "type": "String",
                    "description": "motion detection sensitivity",
                    "default": "medium"
                }
            ],
            "extraValues":
                [
                    {
                        "name": "sensitivity",
                        "value": "${motionSensitivity}"
                    }
                ]
        },
        {
            "name": "grpcExtension",
            "type": "#Microsoft.Media.MediaGraphGrpcExtension",
            "inputs": [
                {
                    "name": "motionDetection",
                    "required": false
                },
                {
                    "name": "frameRateFilter",
                    "required": false
                },
                {
                    "name": "rtspSource",
                    "required": false
                }
            ],
            "extraParameters": [
                {
                    "name": "grpcExtensionAddress",
                    "type": "String",
                    "description": "grpc LVA Extension Address",
                    "default": "tcp://lvaextension:44000"
                },
                {
                    "name": "grpcExtensionUserName",
                    "type": "String",
                    "description": "inferencing endpoint user name.",
                    "default": "dummyUserName"
                },
                {
                    "name": "grpcExtensionPassword",
                    "type": "String",
                    "description": "inferencing endpoint password.",
                    "default": "dummyPassword"
                },
                {
                    "name": "imageEncoding",
                    "type": "String",
                    "description": "image encoding for frames",
                    "default": "jpeg"
                },
                {
                    "name": "imageQuality",
                    "type": "String",
                    "description": "image encoding quality for frames (valid for JPG encoding)",
                    "default": "90"
                },
                {
                    "name": "imageScaleMode",
                    "type": "String",
                    "description": "image scaling mode",
                    "default": "pad"
                },
                {
                    "name": "frameWidth",
                    "type": "String",
                    "description": "Width of the video frame to be received from LVA.",
                    "default": "416"
                },
                {
                    "name": "frameHeight",
                    "type": "String",
                    "description": "Height of the video frame to be received from LVA.",
                    "default": "416"
                }
            ],
            "extraValues":
                [
                    {
                        "name": "endpoint",
                        "value":
                        {
                            "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
                            "url": "${grpcExtensionAddress}",
                            "credentials":
                            {
                                "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
                                "username": "${grpcExtensionUserName}",
                                "password": "${grpcExtensionPassword}"
                            }
                        }

                    },
                    {
                        "name": "image",
                        "value":
                        {
                            "scale": {
                                "mode": "${imageScaleMode}",
                                "width": "${frameWidth}",
                                "height": "${frameHeight}"
                            },
                            "format": {
                                "@type": "#Microsoft.Media.MediaGraphImageFormatEncoded",
                                "encoding": "${imageEncoding}",
                                "quality": "${imageQuality}"
                            }
                        }
                    },
                    {
                        "name": "format",
                        "value":
                        {
                            "mode": "sharedMemory",
                            "SharedMemorySizeMiB": "5"
                        }
                    }
                ]
        },
        {
            "name": "frameRateFilter",
            "type": "#Microsoft.Media.MediaGraphFrameRateFilterProcessor",
            "inputs": [
                {
                    "name": "rtspSource",
                    "required": false
                },
                {
                    "name": "motionDetection",
                    "required": false
                }
            ],
            "extraParameters": [],
            "extraValues":
                [
                    {
                        "name": "maximumFps",
                        "value": "2"
                    }
                ]
        },
        {
            "name": "signalGateProcessor",
            "type": "#Microsoft.Media.MediaGraphSignalGateProcessor",
            "inputs": [
                {
                    "name": "rtspSource",
                    "required": true
                },
                {
                    "name": "iotMessageSource",
                    "required": false
                },
                {
                    "name": "motionDetection",
                    "required": false
                },
                {
                    "name": "grpcExtension",
                    "required": false
                },
                {
                    "name": "httpExtension",
                    "required": false
                }
            ],
            "extraParameters": [],
            "extraValues":
                [
                    {
                        "name": "activationEvaluationWindow",
                        "value": "PT1S"
                    },
                    {
                        "name": "activationSignalOffset",
                        "value": "PT0S"
                    },
                    {
                        "name": "minimumActivationTime",
                        "value": "PT30S"
                    },
                    {
                        "name": "maximumActivationTime",
                        "value": "PT30S"
                    }
                ]
        },
        {
            "name": "httpExtension",
            "type": "#Microsoft.Media.MediaGraphHttpExtension",
            "inputs":
                [
                    {
                        "name": "rtspSource",
                        "required": false
                    },
                    {
                        "name": "frameRateFilter",
                        "required": false
                    },
                    {
                        "name": "motionDetection",
                        "required": false
                    }
                ],
            "extraParameters":
                [
                    {
                        "name": "inferencingUrl",
                        "type": "String",
                        "description": "inferencing Url",
                        "default": "http://yolov3/score"
                    },
                    {
                        "name": "inferencingUserName",
                        "type": "String",
                        "description": "inferencing endpoint user name.",
                        "default": "dummyUserName"
                    },
                    {
                        "name": "inferencingPassword",
                        "type": "String",
                        "description": "inferencing endpoint password.",
                        "default": "dummyPassword"
                    },
                    {
                        "name": "imageEncoding",
                        "type": "String",
                        "description": "image encoding for frames",
                        "default": "bmp"
                    },
                    {
                        "name": "imageScaleMode",
                        "type": "String",
                        "description": "image scaling mode",
                        "default": "preserveAspectRatio"
                    },
                    {
                        "name": "frameWidth",
                        "type": "String",
                        "description": "Width of the video frame to be received from LVA.",
                        "default": "416"
                    },
                    {
                        "name": "frameHeight",
                        "type": "String",
                        "description": "Height of the video frame to be received from LVA.",
                        "default": "416"
                    },
                    {
                        "name": "frameRate",
                        "type": "String",
                        "description": "Rate of the frames per second to be received from LVA.",
                        "default": "2"
                    }
                ],
            "extraValues":
                [
                    {
                        "name": "endpoint",
                        "value":
                        {
                            "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
                            "url": "${inferencingUrl}",
                            "credentials":
                            {
                                "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
                                "username": "${inferencingUserName}",
                                "password": "${inferencingPassword}"
                            }
                        }

                    },
                    {
                        "name": "image",
                        "value":
                        {
                            "scale": {
                                "mode": "${imageScaleMode}",
                                "width": "${frameWidth}",
                                "height": "${frameHeight}"
                            },
                            "format": {
                                "@type": "#Microsoft.Media.MediaGraphImageFormatEncoded",
                                "encoding": "${imageEncoding}"
                            }
                        }
                    }
                ]
        },
        {
            "name": "fileSink",
            "type": "#Microsoft.Media.MediaGraphFileSink",
            "inputs":
                [
                    {
                        "name": "signalGateProcessor",
                        "required": true
                    }
                ],
            "extraParameters": [],
            "extraValues":
                [
                    {
                        "name": "filePathPattern",
                        "value": "/var/media/sampleFilesFromGraph-${System.DateTime}"
                    }
                ]
        },
        {
            "name": "hubSink",
            "type": "#Microsoft.Media.MediaGraphIoTHubMessageSink",
            "inputs":
                [
                    {
                        "name": "httpExtension",
                        "required": false
                    },
                    {
                        "name": "grpcExtension",
                        "required": false
                    },
                    {
                        "name": "motionDetection",
                        "required": false
                    }
                ],
            "extraParameters":
                [
                    {
                        "name": "hubSinkOutputName",
                        "type": "String",
                        "description": "hub sink output name",
                        "default": "inferenceOutput"
                    }
                ],
            "extraValues":
                [
                    {
                        "name": "hubOutputName",
                        "value": "${hubSinkOutputName}"
                    }
                ]
        },
        {
            "name": "assetSink",
            "type": "#Microsoft.Media.MediaGraphAssetSink",
            "inputs":
                [
                    {
                        "name": "rtspSource",
                        "required": false
                    },
                    {
                        "name": "signalGateProcessor",
                        "required": false
                    }
                ],
            "extraParameters":
                [
                    {
                        "name": "hubSinkOutputName",
                        "type": "String",
                        "description": "hub sink output name",
                        "default": "inferenceOutput"
                    }
                ],
            "extraValues":
                [
                    {
                        "name": "assetNamePattern",
                        "value": "sampleAssetFromLVAEdge-${System.DateTime}"
                    },
                    {
                        "name": "segmentLength",
                        "value": "PT30S"
                    },
                    {
                        "name": "LocalMediaCacheMaximumSizeMiB",
                        "value": "2048"
                    },
                    {
                        "name": "localMediaCachePath",
                        "value": "/var/lib/azuremediaservices/tmp"
                    }
                ]
        }
    ]