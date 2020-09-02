/**
 * @fileoverview
 * This file contains the majority of the functionality used across the various web pages, in the following order
 * 1: universal functions
 * 2: functions related to invoking methods
 * 3: camera related functions
 */


//immutable global variables are written in all caps
const PORT = 5000;

/**
 * @global variables. Mutable global variables in javascript are typically named in camelCase
 */
var graphTopologies = {};
var graphInstances = {};
var cameras = {};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// universal functions

/**
* get global variables from server, Returns a promise so that functions that depend on these variables can wait
* @returns {Promise<any>}
*/
function getCamerasFromServer()
{
    return new Promise((resolve, reject) =>
    {
        let request = prepareRequest(`http://localhost:${PORT}/globals`, "GET");
        request.onreadystatechange = function ()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    let response = JSON.parse(request.response);
                    cameras = response.cameras;
                    resolve(response);
                }
                else
                {
                    reject("Get Globals rejection");
                }
            }
            else if (request.status != 200)
            {
                reject("Server not responding");
            }
        }
        request.send();
    });
}

/**
* send current values to the server to be stored for later 
*/
function sendCamerasToServer()
{
    let globals =
    {
        cameras: cameras
    };
    let request = prepareRequest(`http://localhost:${PORT}/globals`, "PUT");
    request.send(JSON.stringify(globals));
}

/**
*  generate request with given parameters to a defined url in server. default method is POST
* @param {string} url - @link to communicate on
* @param {string} requestType - POST or GET request 
* @returns {XMLHttpRequest} - generated, unsent request
*/
function prepareRequest(url, requestType = "POST")
{
    let request = new XMLHttpRequest();
    request.open(requestType, url, true);
    // I would prefer the timeout to be shorter, for security purposes, however when we invoke LVA methods on the device the default max response time in seconds = 200
    request.timeout = 200000;
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.ontimeout = function ()
    {
        console.error("Request timed out");
    }
    return request;
}

/**
* delete all htmlElementents nested within the nearest parent li item
* @param {HTMLButtonElement} htmlElement - what user clicked on
*/
function deleteFromParentListItem(htmlElement)
{
    let id = $(htmlElement).closest('li').attr('id');
    let item = document.getElementById(id);
    item.parentElement.removeChild(item);
}

/**
* create unique ID for an item
* @param {string} nameToInclude - optional name to include in unique id
* @returns {string} - unique ID
*/
function makeUniqueId(nameToInclude = "")
{
    //return nameToInclude + a UUID
    return (nameToInclude + 'xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (char)
    {
        let rand = Math.random() * 16 | 0, v = char == 'x' ? rand : (rand & 0x3 | 0x8);
        return v.toString(16);
    }));
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//configuration page functions
/** 
* grab inputs from configuration. Calls to connect to device and IotHub to make sure your credentials are valid!
*/
function sendConfigData()
{
    let payload =
    {
        "device-id": document.getElementById("device-id").value,
        "iothub-connection-string": document.getElementById("iothub-connection-string").value
    };

    let request = prepareRequest(`http://localhost:${PORT}/connectToIotHub`);
    request.onreadystatechange = function ()
    {
        if (request.readyState == 4)
        {
            document.getElementById("configuration-output-box").innerHTML = request.response;
        }
    }
    request.send(JSON.stringify(payload));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//invoking methods/output related methods

/** 
* show current graph instances in dropdown. Used in output.html when invoking methods 
* @param {string} methodName - name of method on dropdown button
*/
function instanceMethodDropdowns(methodName)
{
    let hoverList = document.getElementById(methodName + "-dropdown");
    let onclickMethod = `graphEntityModify(this, "${methodName}", false)`;
    hoverList.innerHTML = "";
    let checkBoxNameList = [];
    switch (hoverList.getAttribute("typeoflist"))
    {
        case 'instance-list':
            checkBoxNameList = Object.keys(graphInstances);
            break;
        case 'topology-list':
            checkBoxNameList = Object.keys(graphTopologies);
            break;
        default:
            break;
    }

    checkBoxNameList.forEach((item) =>
    {
        hoverList.innerHTML += "<li> <button class='btn btn-outline-secondary' onclick='" + onclickMethod + "' name='" + methodName + "'>" + item + "</button> </li>";
    });
}

/**
* Create the larger payload object to be sent to the server to invoke a direct method on the lvaEdge module
* @param {string} methodNameParam - name of method to invoke
* @param {jsonObject} methodPayload - payload for method
* @returns {jsonObject} full payload for request
*/
function createFullPayload(methodNameParam, methodPayload)
{
    return {
        methodName: methodNameParam,
        Payload: methodPayload
    }
}

/**
* see sample graph topologies here: https://github.com/Azure/live-video-analytics/tree/master/MediaGraph/topologies
* @param {Object} topology - graph topology JSON object
* @returns {void}
*/
function graphSetTopology(topology)
{

    invokeLVAMethod(createFullPayload("GraphTopologySet", topology)).then(() =>
    {
        // do nothing, invokeLVAMethod handles
    }).catch((error) =>
    {
        alert(JSON.parse(error).payload.error || JSON.parse(error));
        console.error(error);
    });
}


/**
* invoke a list method on lvaEdge module (either list topology or list instances. payload is the same)
* @param {string} methodName - method name (either GraphTopologyList or GraphInstanceList)
* @returns {Promise<any>}
*/
function graphEntityList(methodName)
{
    return new Promise((resolve, reject) =>
    {
        let payload =
        {
            "@apiVersion": "1.0"
        };

        invokeLVAMethod(createFullPayload(methodName, payload)).then((response) =>
        {
            resolve(response);
        }).catch((error) =>
        {
            reject(error);
        });
    });
}

/**
* this payload is used for GraphInstanceDelete, GraphTopologyDelete, GraphInstanceActivate, GraphInstanceDeactivate
* @param {string | HTMLButtonElement} htmlElement - button clicked on to invoke method on given element or string of element name (i.e. "Graph-Instance-1")
* @param {string} methodName - method name
* @param {boolean} elementNamePassed - true if function caller passed in the 
*/
function graphEntityModify(htmlElement, methodName, elementNamePassed = false)
{
    let elementName = elementNamePassed ? htmlElement : htmlElement.innerText;
    let payload =
    {
        "@apiVersion": "1.0",
        name: elementName
    };
    invokeLVAMethod(createFullPayload(methodName, payload)).then(() =>
    {
        // do nothing, invokeLVAMethod handles
    }).catch((error) =>
    {
        console.error(error);
    });
}


/**
* calls GraphInstanceList and GraphTopologyList. Runs on load of output.html
* @async
* @returns {Promise<void>}
*/
async function loadInstancesAndTopologies()
{
    getCamerasFromServer().then(() =>
    {
        graphEntityList("GraphInstanceList").then(() =>
        {
            graphEntityList("GraphTopologyList");
        }).catch((error) =>
        {
            console.error(error);
        });
    }).catch((error) =>
    {
        console.error(error);
    });
}

/**
* Update instance names/topology names when invoking list method on LVA
* @param {string} methodName - Name of method invoked
* @param {XMLHttpRequestResponseType} response - JSON response object from request
* @returns {void}
*/
function updateGraphsandInstances(methodName, response)
{
    let namesArray = response.payload.value;
    if (namesArray.length != 0)
    {
        namesArray.forEach((item) =>
        {
            switch (methodName)
            {
                case "GraphInstanceList":
                    let instancePayload =
                    {
                        "@apiVersion": "1.0",
                        "name": item.name,
                        "properties":
                        {
                            "topologyName": item.properties.topologyName,
                            "description": item.properties.description,
                            "parameters": item.properties.parameters
                        }
                    }
                    graphInstances[item.name] = instancePayload;
                    break;

                case "GraphTopologyList":
                    if (graphTopologies[item.name] == undefined)
                    {
                        let newGraph = constructMediaGraphJSON(item.name, item.description, item.properties.sources, item.properties.processors, item.properties.sinks, item.properties.parameters);
                        graphTopologies[item.name] = newGraph;
                    }
                    break;
            }
        });
    }
    return;
}

/**
* displays method invocation output when on output.html page
* returns true if on output.html page, false otherwise
* @param {jsonObject} result - resulting JSON to display to user
* @returns {boolean} - true if able to display result in method-output-box (will be true when on output.html page)
*/
function displayMethodOutput(result)
{
    let htmlElement = document.getElementById("method-output-box");
    if (htmlElement != null)
    {
        htmlElement.innerText = result;
        return true;
    }
    return false;
}

/**
* send method to invoke on LVA module
* @param {jsonObject} fullPayload - payload to be sent in request to server
* @returns {Promise<any>}
*/
function invokeLVAMethod(fullPayload)
{
    return new Promise((resolve, reject) =>
    {
        let request = prepareRequest(`http://localhost:${PORT}/runMethod`);
        // event listener. When request readyState changes, place response in the output box. If response is done (readyState=4) then update global vars accordingly
        request.onreadystatechange = function ()
        {
            //on successful response. Result is object like [{methodName: 'GraphTopologyList'}, {value: 'long JSON object....'}]
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
                    var methodName = JSON.parse(request.response)[0].method;
                    var result = JSON.stringify(JSON.parse(request.response)[1]);
                    var isFromOutputPage = displayMethodOutput(result);

                    if (JSON.parse(result).status < 250)
                    {
                        switch (methodName)
                        {
                            case 'GraphTopologyDelete':
                                delete graphTopologies[fullPayload.Payload.name];
                                break;
                            case 'GraphInstanceDelete':
                                delete graphInstances[fullPayload.Payload.name];
                                break;
                            case 'GraphInstanceList':
                                updateGraphsandInstances(methodName, JSON.parse(request.response)[1]);
                                break;
                            case 'GraphTopologyList':
                                updateGraphsandInstances(methodName, JSON.parse(request.response)[1]);
                                break;
                            case 'GraphInstanceSet':
                                graphInstances[fullPayload.Payload.name] = fullPayload;
                                break;
                            case 'GraphTopologySet':
                                // only alert and run display media graphs if request is coming from mediagraphs.html page
                                graphTopologies[fullPayload.Payload.name] = fullPayload;
                                if (!isFromOutputPage)
                                {
                                    alert("Success!");
                                    displayMediaGraphs();
                                }
                                break;
                            default:
                                break;
                        }
                        resolve(result);
                    }
                }
                else
                {
                    if(request.response != "") alert(request.response);
                    reject(request.response);
                }
            }
            else
            {
                if (request.response != "" && request.status != 404 && JSON.parse(request.response)[1] != undefined)
                {
                    displayMethodOutput(JSON.stringify(JSON.parse(request.response)[1]));
                }
            }
        }
        request.send(JSON.stringify(fullPayload));
    });
}

/**
* stream device to cloud messages from IoT Hub via websocket, opened server side
*/
function emitdata()
{
    let request = prepareRequest(`http://localhost:${PORT}/hubmessages`, "GET");
    request.onreadystatechange = function ()
    {
        //on successful response. Result is object like [{methodName: 'GraphTopologyList'}, {value: 'long JSON object....'}]
        if (request.readyState == 4 && request.status == 200)
        {
            document.getElementById('stop-messages').disabled = false;
            document.getElementById('start-messages').disabled = true;
        }
        else if (request.readyState == 4 && request.status == 404)
        {
            alert(request.response);
        }
    }
    request.send();
}

/**
 * stop receiving device-cloud IoT Hub messages
 */
function stopMessages()
{
    let request = prepareRequest(`http://localhost:${PORT}/stopMessages`);
    request.send();
    document.getElementById('stop-messages').disabled = true;
    document.getElementById('start-messages').disabled = false;
    document.getElementById("iothub-message-output-box").innerHTML="";
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// camera-related methods

/**
* creates template object of camera values to display to user
* @param {string} cameraName - name of camera to create template for
* @returns {HTMLTemplateElement}
*/
function createCameraTableFromTemplate(cameraName)
{
    let template = $('#created-camera-template').html();
    template = $(template).clone();
    let listItem = template[0];
    $(listItem).attr({ 'id': makeUniqueId() });

    let values_column = $(template)[0].getElementsByTagName('tr')[1];
    values_column.children[0].innerHTML = cameraName;
    values_column.children[1].innerHTML = cameras[cameraName].url;
    values_column.children[2].innerHTML = cameras[cameraName].username;
    values_column.children[3].innerHTML = "******";
    return template;
}

/**
* function to run on load of cameras.html page
*/
function camerasOnLoad()
{
    getCamerasFromServer().then(() =>
    {
        displayCameras();
    }).catch((error) =>
    {
        alert(error);
    })
}

/**
* display all current user set cameras
*/
function displayCameras()
{
    let camerasList = $('#existing-cameras');
    $(camerasList)[0].innerHTML = "";

    Object.keys(cameras).forEach((cam) =>
    {
        camerasList.append(createCameraTableFromTemplate(cam));
    });

    if ($(camerasList)[0].innerHTML == "")
    {
        $(camerasList)[0].innerHTML = "You currently have no cameras set up";
    }
}


/**
* add user-input camera values to global cameras list. User can add multiple cameras at once
*/
function submitCameras()
{
    let entries = document.getElementsByTagName("input");
    cameras[entries[0].value] =
    {
        "url": entries[1].value,
        "username": entries[2].value,
        "password": entries[3].value
    }

    for (inputBox of entries)
    {
        inputBox.value = "";
    }

    displayCameras();
}

/** 
* delete camera
* @param {HTMLSpanElement} htmlElement - the delete button, gets passed in on click
*/
function deleteCamera(htmlElement)
{
    let name = $(htmlElement).closest('table')[0].getElementsByTagName('tr')[1].children[0].innerText;
    delete cameras[name];
    deleteFromParentListItem(htmlElement);
    displayCameras();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// graph instance methods

/**
* set a graph instance
* asks user for lots of parameters
*/
function setGraphInstance()
{
    //get each of the parameters and their values
    let parametersObject = [];
    let parameters = document.getElementsByClassName("parameter-input");
    for (let param of parameters)
    {
        if (param.value == "") param.value = param.getAttribute("placeholder");
        parametersObject.push(
            {
                "name": param.getAttribute('id'),
                "value": param.value
            });
    };

    let instanceName = document.getElementById("instance-name-input").value;
    let topologyName = document.getElementById("instanceset-topology").getAttribute("name");
    let instanceDescription = document.getElementById("instance-description-input").value;
    //create the request object
    let payload =
    {
        "@apiVersion": "1.0",
        "name": instanceName,
        "properties":
        {
            "topologyName": topologyName,
            "description": instanceDescription,
            "parameters": parametersObject
        }
    }

    invokeLVAMethod(createFullPayload("GraphInstanceSet", payload)).then((response) =>
    {
        // do nothing, already handled by LVA method
    }).catch((error) =>
    {
        console.error(error);
    });

    //reset the Set Graph Instance modal
    $('#parameter-list')[0].innerHTML = "";
    $('#instanceset-topology').innerHTML = "";
    $('#instanceset-camera').innerHTML = "";
    $('#instance-description-input').innerHTML = "";
}

/** 
* GraphInstanceSet: set up parameters! 
*/
function populateModalTemplate()
{
    //find the currently set graph topology
    let modal = document.getElementById("myModal");
    let modalObjects = modal.getElementsByClassName("modal-item");
    let content = modal.getElementsByClassName("all-set-instance-content");
    let currentSelect = modalObjects[0]

    content[0].style.visibility = "visible";

    //for each topology display the name as option for user to set instance on
    Object.keys(graphTopologies).forEach((graphName) =>
    {
        currentSelect.innerHTML += "<option value=" + graphName + ">" + graphName + "</option>";
    })

    //add select menu for user to choose one of the current cameras
    currentSelect = modalObjects[3];

    //for each camera display the name as option for user to use in instance
    Object.keys(cameras).forEach((cam) =>
    {
        currentSelect.innerHTML += "<option value=" + cam + ">" + cam + "</option>";
    });
}

/**
* Populates instance template with camera parameters based on user selection.
* @param {HTMLOptionElement} htmlElement - user selected option from camera drop down
*/
function loadCameraParams(htmlElement)
{
    let theChosenCamera = cameras[htmlElement.value];
    document.getElementById("rtspUrl").value = theChosenCamera.url;
    document.getElementById("rtspUserName").value = theChosenCamera.username;
    document.getElementById("rtspPassword").value = theChosenCamera.password;
}

/**
* adds all the parameters and default values to the modal template after user selects a topology, while running set graph instance
* @param {HTMLOptionElement} htmlElement - graph topology clicked on by user
*/
function loadTopologyParams(htmlElement)
{
    let mediaGraph = graphTopologies[htmlElement.value];
    document.getElementById("instanceset-topology").name = htmlElement.value;
    let obj = $('#parameter-list');

    //can't do get htmlElementent by id on a template
    obj[0].innerHTML = "";

    //create new parameter template and add the default values in for each one
    mediaGraph.properties.parameters.forEach((parameter) =>
    {
        let parameterTemplate = $('#parameter-template').html();
        parameterTemplate = $(parameterTemplate).clone();
        parameterTemplate[0].getElementsByClassName("information")[0].innerHTML = parameter.name + ": " + parameter.description;

        if (parameter.hasOwnProperty("default"))
        {
            parameterTemplate[0].getElementsByClassName("parameter-input")[0].setAttribute("placeholder", parameter.default);
        }

        parameterTemplate[0].getElementsByClassName("parameter-input")[0].setAttribute("id", parameter.name);
        obj[0].appendChild(parameterTemplate[0]);
    });
}
