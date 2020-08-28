/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//media graph building related functions
const GITHUBTOPOLOGIES = 'https://raw.githubusercontent.com/Azure/live-video-analytics/master/MediaGraph/topologies/';
var sourceNames = [];
var processorNames = [];
var sinkNames = [];

/**
* class for a graph node. Dynamically built upon media graph creation, based off the node type and the 
* inputs. 
*/
class GraphNode {
    constructor(type, userSelectedInputs)
    {
        //ensure node type exists
        this.nodeSchema=getNodeSchema(type);
        if (this.nodeSchema==undefined) throw ("Node type: "+type+" not found");

        //set inputs
        this.inputs=[];
        for(var i=0; i<userSelectedInputs.length; i++)
        {
            if (findObjectByKey(this.nodeSchema.inputs, "name", userSelectedInputs[i]))
            {
                this.inputs.push({"nodeName": userSelectedInputs[i]});
            }
            else throw ("Input "+userSelectedInputs[i]+" is not accepted by node type "+type);
        }

        this.jsonObj = 
        {
            "name": type,
            "@type": this.nodeSchema.type,
        }

        // must check that not a source node. Otherwise, will break media graph
        if (!type.toLowerCase().includes("source"))
        {
            this.jsonObj["inputs"]=this.inputs;
        }

        for(var i=0; i<this.nodeSchema.extraValues.length; i++)
        {
            var item=this.nodeSchema.extraValues[i];
            this.jsonObj[item.name]=item.value;
        }
        //we have now constructed the full json object!

        this.nodeParameters=this.nodeSchema.extraParameters;
    }
}

/**
 * MediaGraph class, contains name, desciption, sources, processors, sinks, and parameters. Creates a nice jsonObject to be used as a payload later. 
 */
class MediaGraph
{
    constructor(graphname, description="no description set", sources, processors, sinks, parameters)
    {
        this.graphname=graphname;
        this.sources=sources;
        this.processors=processors;
        this.sinks=sinks;
        this.parameters=parameters;
        this.jsonObject = {
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

        console.log(this.jsonObject);
    }
}

/**
 * find item in list by key (for searching JSON objects)
 * @param {array to search} array 
 * @param {key to search by} key 
 * @param {value to look for} value 
 */
function findObjectByKey(array, key, value)
{
    for (var i=0; i<array.length; i++)
    {
        if (array[i][key]===value)
        {
            return array[i];
        }
    }
    return undefined;
}

/** 
* get all the valid inputs for a given node type (does this by checking the type's schema)
*/
function getValidInputs(schema)
{
    var validInputs=[];
    for (var i=0; i<schema.inputs.length; i++)
    {
        validInputs.push(schema.inputs[i].name);
    }
    return validInputs;
}

/**
* get schema for a give node type using the graphNodeLimitations schema at the bottom of this document
*/
function getNodeSchema(type)
{
    for(var i=0; i<graphNodeLimitations.length; i++)
    {
        if(graphNodeLimitations[i].name===type)
        {
            return graphNodeLimitations[i];
        }
    }
    return undefined;
}

/**
 * show checkbox options of possible node inputs. Used when building media graph. Doesn't modify globals or cookies
 * @param {dropdown menu item} hoverList 
 * @param {node name} myName 
 * @param {source, processor, or sink list id} listID 
 */
function setCustomInputs(hoverList, myName, listID) 
{
    var allowedInputs=getValidInputs(getNodeSchema(myName));
    if (allowedInputs.length==0) return;
    var checkBoxNameList = [];
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

/** update the list of possible inputs on a given node */
function updateCustomizedInputs(htmlElement) 
{
    var hoverList = htmlElement.parentElement.getElementsByTagName("ul")[0];
    hoverList.innerHTML = "";
    var listID = htmlElement.closest(".node-listhead").id;
    var myName = htmlElement.parentElement.parentElement.getAttribute('nodetype');
    setCustomInputs(hoverList, myName, listID);
}

/**
 * returns true if you can add the node type to the graph. 
 * @param {type of node to add to graph} type 
 */
function canAddToGraph(type)
{
    var neededInputs=getValidInputs(getNodeSchema(type));
    for (var i=0; i<neededInputs.length; i++)
    {
        if(graphBuilderContains(neededInputs[i])) return true;
    }
    alert("You must have at least one of the following node types present before you can add this node: "+neededInputs);
    return false;
}

/**
* if node in list nodeNames doesn't have any valid inputs apart from type, returns false
* @param {list of nodes to check} nodeNames 
* @param {node to delete} type 
*/
function canDeleteHelper(nodeNames, type)
{
    var currentCheck=false;
    var ind=nodeNames.indexOf(type);
    if(ind!=-1) nodeNames.splice(ind, 1);
    for(var i=0; i<nodeNames.length; i++)
    {
        var neededInputs=getValidInputs(getNodeSchema(nodeNames[i])); //get valid inputs for each node we're looking at
        if(!neededInputs.includes(type)) //if type we want to delete isn't an input for this node, move on
        {
            currentCheck=true;
        }
        else
        {
            neededInputs.splice(neededInputs.indexOf(type), 1); //get rid of node to delete, check if graph contains any other required node
            for (var j=0; j<neededInputs.length; j++)
            {
                if(graphBuilderContains(neededInputs[j])) currentCheck=true;
                break;
            }
        }
            
        if(!currentCheck)
        {
            alert("You cannot delete this node. It is needed for node "+nodeNames[i]);
            return false;
        }
        currentCheck=false;
    }
    return true;
}

/**
 * this method will return false if the node is required as an input for another node
 * @param {check if can delete type} type 
 */
function canDeleteFromGraph(type)
{
    if(type=="rtspSource")
    {
        alert("You cannot build a graph without an RTSP Source node!");
        return false;
    }
    
    if(canDeleteHelper(processorNames, type) && canDeleteHelper(sinkNames, type)) return true;
    else return false;
}

/**
 * adds a node to the Media Graph in creation
 * @param {current htmlElementent to add to graph} htmlElement 
 * @param {source, processor, or sink} listID 
 */
function addToGraph(htmlElement, listID) {
    var nodetype = htmlElement.getAttribute('nodetype');
    var template = (listID=='dynamic-source') ? $('#hidden-template-sourcenode').html() : $('#hidden-template').html();
    template = $(template).clone();

    if(listID != 'dynamic-source' && !canAddToGraph(nodetype)) return;

    //disable addition of another identical node
    $(htmlElement).attr({"disabled": true});

    //can only have one or the other, not both
    if (nodetype == "grpcExtension" || nodetype == "httpExtension")
    {
        $('#grpcExtension-dropdown').attr({'disabled': true});
        $('#httpExtension-dropdown').attr({'disabled': true});
    }

    var newName = htmlElement.name.replace(/_/g, " ");

    var li = template[0];
    var deleteButton = template[0].children[0].children[0];

    //add unique IDs onto htmlElementents. Set close aspect of button
    $(li).closest('label').attr({ 'id': makeUniqueId() });
    $(li).attr({ "id": makeUniqueId(htmlElement.name), "name": newName, "nodetype": nodetype });
    $(deleteButton).html("<span class='close close-button' aria-hidden='true' onclick='deleteGraphNode(this)'>&times;</span>" + newName);

    pushNodeName(nodetype, listID);

    if(!listID == 'dynamic-source')
    {
        var hoverList = template[0].getElementsByClassName("dropdown-menu-left")[0];
        setCustomInputs(hoverList, nodetype, listID);
    }

    //Finally, insert finished template into the DOM
    $('#' + listID).append(template);
    return;
}

/**
 * returns if the graph being built contains a node of type type
 * @param {type of node to look for, i.e. rtspSource, fileSink} type  
 */
function graphBuilderContains(type)
{
    if (sourceNames.includes(type) || processorNames.includes(type) || sinkNames.includes(type)) return true;
    else return false;        
}

/**
 * Delete a graph node from builder as the media graph is being created.
 * @param {this is the span containing the 'X' on the item to delete} htmlElement 
 */
function deleteGraphNode(htmlElement) 
{
    var nodetype = $(htmlElement).closest('li').attr('nodetype');

    if(!canDeleteFromGraph(nodetype)) return false;

    // re-enable user to add this type of node again
    document.getElementById((nodetype+"-dropdown")).disabled = false;

    //re-enable addition of an external AI module node
    if (nodetype == "grpcExtension" || nodetype == "httpExtension")
    {
        $('#grpcExtension-dropdown').attr({'disabled': false});
        $('#httpExtension-dropdown').attr({'disabled': false});
    }

    var listID = $(htmlElement).closest('ul').attr('id');

    //delete node from list that builds it!
    switch(listID)
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
    }

    deleteFromParentListItem(htmlElement);
    return true;
}

/**
 * basic helper function, adds a name to a given list
 * @param {node name} name 
 * @param {list of nodes} listID 
 */
function pushNodeName(name, listID) 
{
    if (listID == "dynamic-source") sourceNames.push(name);
    else if (listID == "dynamic-processor") processorNames.push(name);
    else sinkNames.push(name);
}

/**
 * returns all nodes and inputs from a given list, so if nodeList="dynamic-sink" this would return all of the 
 * sink nodes and the user-checked inputs from the graph builder
 * @param {list to fetch nodes and inputs from} nodeList 
 */
function getListNodesAndInputs(nodeList)
{
    var nodesAndInputs=[];
    for (var procs of nodeList.getElementsByClassName('graphnode'))
    {
        var name=procs.getAttribute('nodetype');
        var checkedInputs=[];
        var checkBoxes = procs.getElementsByTagName('input');

        for (var box of checkBoxes)
        {
            if(box.checked) checkedInputs.push((box.parentElement.innerText).replace(/ /g,''));
        }

        nodesAndInputs.push({name: name, value: checkedInputs});
    }
    console.log(nodesAndInputs);
    return nodesAndInputs;
}

/**
 * returns an array of all the sources, processors, sinks, and their inputs built by the user
 */
function getGraphNodesAndInputs()
{
    var allNodeInfo=[];
    allNodeInfo.push(getListNodesAndInputs(document.getElementById('dynamic-source')));
    allNodeInfo.push(getListNodesAndInputs(document.getElementById('dynamic-processor')));
    allNodeInfo.push(getListNodesAndInputs(document.getElementById('dynamic-sink')));
    console.log(allNodeInfo);
    return allNodeInfo;
}

/**
 * validates that the graph built by the user doesn't break any rules
 * @param {all nodes and inputs in graph builder} nodesAndInputsList 
 */
function validateGraph(nodesAndInputsList)
{
    //all processors and sources must have at least one input
    //TODO make sure all nodes are referenced by another
    if(nodesAndInputsList[2].length==0)
    {
        alert("You must have at leastone sink node!");
        return false;
    }
    for(i=1; i<3; i++) //check processors and sinks for inputs
    {
        for(var cur=0; cur<nodesAndInputsList[i].length; cur++)
        {
            if(nodesAndInputsList[i][cur].value.length==0)
            {
                alert("All processors and sinks must have at least one input. This node has none: " + nodesAndInputsList[i][cur].name);
                return false;
            }
        }
    }
    return true;
}

/** 
* create a media graph based off of what the user-built 
*/
function createMediaGraph() {
  var graphname = document.getElementById("graphname").value;
  var graphDescription = document.getElementById("graph-description").value;
  if (graphname=="") 
  {
      alert("Your graph name cannot be empty!");
      return;
  }
  var sources=[];
  var processors=[];
  var sinks=[];
  var parameters=[]
  var nodesAndInputs=getGraphNodesAndInputs();

  if(!validateGraph(nodesAndInputs))
  {
      return false;
  }

  for (var s=0; s< nodesAndInputs[0].length; s++)
  {
      tempSourceNode = new GraphNode(nodesAndInputs[0][s].name, nodesAndInputs[0][s].value);
      sources.push(tempSourceNode.jsonObj);
      parameters=parameters.concat(tempSourceNode.nodeParameters);
  }

  for (var p=0; p< nodesAndInputs[1].length; p++)
  {
      tempProcessorNode = new GraphNode(nodesAndInputs[1][p].name, nodesAndInputs[1][p].value);
      processors.push(tempProcessorNode.jsonObj);
      parameters=parameters.concat(tempProcessorNode.nodeParameters);
  }
  for (var sink=0; sink< nodesAndInputs[2].length; sink++)
  {
      tempSinkNode = new GraphNode(nodesAndInputs[2][sink].name, nodesAndInputs[2][sink].value);
      sinks.push(tempSinkNode.jsonObj);
      parameters=parameters.concat(tempSinkNode.nodeParameters);
  }

  var createdGraph = new MediaGraph(graphname, graphDescription, sources, processors, sinks, parameters);
  
  graphTopologies[graphname] = createdGraph.jsonObject;

  graphSetTopology(graphname, true);
  document.getElementById("dynamic-source").innerHTML="Sources: ";
  document.getElementById("dynamic-processor").innerHTML="Processors: ";
  document.getElementById("dynamic-sink").innerHTML="Sinks: ";

  //re-enable all buttons
  var resetButtons=document.getElementsByClassName("dropdown-item");
  for (button in resetButtons)
  {
      button.disabled = false;
  }
  graphname.value="";
  graphDescription.value="";
  return true;
}

/**
 * Display media graphs on page
 */
function displayMediaGraphs()
{
    var mediaGraphs=Object.keys(graphTopologies);
    var mediaGraphTBody = $('#existing-media-graphs');
    $(mediaGraphTBody)[0].innerHTML="";

    // for each graph we have show. Ugly element finding, but it does the trick
    mediaGraphs.forEach((graph) => 
    {
      var template = $('#created-graph-template').html();
      template = $(template).clone();
      $(template)[0].setAttribute('id', makeUniqueId());
      var values_column=$(template)[0].getElementsByTagName('td')[0];
      values_column.innerHTML=graph;
      mediaGraphTBody.append(template);
    }); 
}

function setMediaGraphFromTemplate(htmlElement)
{
    var jsonLocation = GITHUBTOPOLOGIES+htmlElement.name+"/topology.json";
    $.getJSON(jsonLocation, function(response) {
        console.log(response);
        graphTopologies[response.name]=response;
        graphSetTopology(response.name, true);
    })
}

/**
 * display existing media graphs by name, on page. Onload function for mediagraph.html
 * chained promises!!!
 */
function displayMediaGraphsOnLoad()
{
    getGlobals().then((fulfilled)=>
    {
        graphEntityList("GraphTopologyList", true).then((response) => 
        {
            displayMediaGraphs();
        }).catch(reason => 
            { 
                console.log(reason);
            });
    }).catch(reason => 
        {
            console.log(reason);
        });
}

/**
 * delete's a graph if user clicks delete on a current graph in the Media Graph page
 * @param {item clicked on to delete} htmlElement 
 */
function deleteGraph(htmlElement)
{
    var graphToDelete=htmlElement.parentElement.previousElementSibling.innerText;
    graphEntityModify(graphToDelete, "GraphTopologyDelete", true, true);
    var id = $(htmlElement).closest('tr').attr('id');
    var tableItem = document.getElementById(id);
    tableItem.parentElement.removeChild(tableItem);
}


/** 
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
                    "name": "motionDetection",
                    "required": false //??
                },
                {
                    "name": "grpcExtension",
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