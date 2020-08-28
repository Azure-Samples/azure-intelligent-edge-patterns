//global variables. Mutable global variables in javascript are typically named in camelCase
var graphTopologies={};
var graphInstances={};

//immutable global variables are written in all caps
const MODULE_ID="lvaEdge";
/** universal functions */

/**
 * get global variables from server, Returns a promise so that functions that depend on these variables can wait
 */
function getGlobals()
{
  return new Promise((resolve, reject) => 
  {
    var request = sendRequest("", "http://localhost:5000/getglobals", "GET");
    request.onreadystatechange = function () 
    {
      if(request.readyState == 4 && request.status == 200)
      {
        let response= JSON.parse(request.response);
        console.log(response);
        for (var list in response)
        {
          let temp=response[list].name;
          switch(temp)
          {
            case 'graphInstances':
              graphInstances=response[list].value;
              break;
            case 'graphTopologies':
              graphTopologies=response[list].value;
              break;
          }
        }
        console.log(`resolving response!${response}`);
        resolve(response);
      }
    }
  });
}

/**send current values to the server to be stored for later */
function sendGlobals()
{
  var globs = [
    {"name": "graphInstances",
    "value": graphInstances},
    {"name": "graphTopologies",
    "value": graphTopologies},
  ]
  sendRequest(globs, 'http://localhost:5000/globals');
}

/**
 *  send post request with given parameters to a defined url in server *
 */ 
function sendRequest(parameters, url, requestType="POST") 
{
  var request = new XMLHttpRequest();
  request.open(requestType, url, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  if(requestType=="GET")
  {
    request.send();
  }
  else
  {
    request.send(JSON.stringify(parameters));
  }  
  return request;
}

/**
 * delete all htmlElementents nested within the nearest parent li item
 * @param {onclick htmlElementent} htmlElement 
 */
function deleteFromParentListItem(htmlElement) 
{
  var id = $(htmlElement).closest('li').attr('id');
  var item = document.getElementById(id);
  item.parentElement.removeChild(item);
}

/**
 * create unique ID for an item
 * @param {optional name to include in unique id} htmlElement 
 */
function makeUniqueId(htmlElement = "") 
{
  return (htmlElement + CreateUUID());
}

/**
 * Creates a UUID 
 */
function CreateUUID() 
{
  return 'xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (char) 
  {
    var rand = Math.random() * 16 | 0, v = char == 'x' ? rand : (rand & 0x3 | 0x8);
    return v.toString(16);
  });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//invoking methods/output related methods

/** 
 * show current graph instances in dropdown. Used in output.html when invoking methods 
*/
function instanceMethodDropdowns(htmlElement) 
{
  var hoverList = htmlElement.parentElement.getElementsByTagName("ul")[0];
  var onclickMethod = 'graphEntityModify(this, "", false, false)';
  hoverList.innerHTML = "";
  var checkBoxNameList = [];
  switch(hoverList.id)
  {
    case 'instance-list':
      checkBoxNameList=Object.keys(graphInstances);
      break;
    case 'topology-list':
      checkBoxNameList=Object.keys(graphTopologies);
      break;
    case 'topology-set':
      checkBoxNameList=Object.keys(graphTopologies);
      onclickMethod='setGraphTopology(this)';
      break;
  }

  checkBoxNameList.forEach((item) => 
  {
    hoverList.innerHTML += "<li> <button class='btn btn-outline-secondary' data-toggle='dropdown' onclick='"+onclickMethod+"' name='" + htmlElement.getAttribute('name') + "'type='checkbox'>" + item + "</button> </li>";
  });
}

/**
 * Create the larger payload object to be sent to the server to invoke a direct method on the lvaEdge module
 * @param {name of method to invoke} methodNameParam 
 * @param {payload for method} methodPayload 
 */
function createFullPayload(methodNameParam, methodPayload)
{
  var values = 
  {
    deviceId: getCookie("device-id"),
    moduleId: MODULE_ID,
    methodName: methodNameParam,
    responseTimeoutInSeconds: 200,
    Payload: methodPayload  
  }
  return values;
}

/**
 * see sample graph topologies here: https://github.com/Azure/live-video-analytics/tree/master/MediaGraph/topologies
 * @param {either the graph name or the HTML htmlElementent containing the name of the graph} htmlElement 
 */
function setGraphTopology(htmlElement, nameIsPassed=false)
{
  var topologyName=htmlElement.innerText;
  if (nameIsPassed)
  {
    var topologyName=htmlElement;
  }

  var topology = graphTopologies[topologyName];
  if(topology == undefined)
  {
    alert("Topology "+topologyName+" not found.");
    return;
  }
  invokeLVAMethod(createFullPayload("GraphTopologySet", topology));
}

/**
 * invoke a list method on lvaEdge module (either list topology or list instances. payload is the same)
 * @param {button clicked to invoke method} htmlElement 
 */
function graphEntityList(htmlElement, nameIsPassed=false) 
{
  return new Promise((resolve, reject) =>
  {
    var methodName = nameIsPassed ? htmlElement : htmlElement.getAttribute('name');
    let payload = {
      "@apiVersion": "1.0"
    }
    invokeLVAMethod(createFullPayload(methodName, payload)).then((response) =>
    {
      resolve(response);
    });
  });
}

/**
 * this payload is used for GraphInstanceDelete, GraphTopologyDelete, GraphInstanceActivate, GraphInstanceDeactivate
 * @param {element clicked on to invoke method} htmlElement 
 */
function graphEntityModify(htmlElement, method="", elementNamePassed=false, methodNameIsPassed=false) 
{
  var elementName = elementNamePassed ? htmlElement : htmlElement.innerText;
  var methodName = methodNameIsPassed ? method : htmlElement.name;
  let payload = 
  {
    "@apiVersion": "1.0",
    name: elementName
  }
  invokeLVAMethod(createFullPayload(methodName, payload));
}


/**
 * calls GraphInstanceList and GraphTopologyList. 
 */
async function loadInstancesAndTopologies()
{
  getGlobals();
  graphEntityList("GraphInstanceList", true);
  graphEntityList("GraphTopologyList", true);
}

/**
 * Update instance names/topology names when invoking list method on LVA
 * @param {Name of method invoked} methodName 
 * @param {JSON response object from request} response 
 */
function updateGraphsandInstances(methodName, response) 
{
  if (methodName == "GraphInstanceList") instanceNames = [];
  if (methodName == "GraphTopologyList") topologyNames = [];
  let namesArray = response.payload.value;

  if (namesArray.length != 0)
  {
    namesArray.forEach((item) => 
    {
      switch(methodName)
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
          if (graphTopologies[item.name] == undefined )
          {
            let newGraph = new MediaGraph(item.name, item.description, item.properties.sources, item.properties.processors, item.properties.sinks, item.properties.parameters);
            graphTopologies[item.name] = newGraph.jsonObject;
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
 * @param {resulting JSON to display to user} result 
 */
function displayMethodOutput(result)
{
  var htmlElement=document.getElementById("method-output-box");
  if (htmlElement != null)
  {
    htmlElement.innerText = result;
    return true;
  }
  return false;
}

/**
 * send method to invoke on LVA module
 * @param {*} values 
 */
async function invokeLVAMethod(values) 
{
  return new Promise((resolve, reject) => 
  {
    var request = sendRequest(values, "http://localhost:5000/runmethod");
    // event listener. When request readyState changes, place response in the output box. If response is done (readyState=4) then update global vars accordingly
    request.onreadystatechange = function () 
    {
      //on successful response. Result is object like [{methodName: 'GraphTopologyList'}, {value: 'long JSON object....'}]
      if (request.readyState == 4 && request.status == 200) 
      {
        var methodName=JSON.parse(request.response)[0].method;
        var result=JSON.stringify(JSON.parse(request.response)[1]);
        var isFromOutputPage=displayMethodOutput(result);

        switch(methodName)
        {
          case 'GraphTopologyDelete':
            delete graphTopologies[values.Payload.name];
            break;
          case 'GraphInstanceDelete':
            delete graphInstances[values.Payload.name];
            break;
          case 'GraphInstanceList':
            updateGraphsandInstances(methodName, JSON.parse(request.response)[1]);
            console.log("updating graphs and instances, method name: "+methodName+" and response: "+result);
            break;
          case 'GraphTopologyList':
            updateGraphsandInstances(methodName, JSON.parse(request.response)[1]);
            console.log("updating graphs and instances, method name: "+methodName+" and response: "+result);
            break;
          case 'GraphInstanceSet':
            graphInstances[values.Payload.name]=values;
            break;
          case 'GraphTopologySet':
            // only alert and run display media graphs if request is coming from mediagraphs.html page
            if(!isFromOutputPage && JSON.parse(result).status < 250)
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
      else
      {
        console.log("invokeLVAMethod request response is: "+ request.response+ "request status is: "+request.status);
        if(request.response != "" && JSON.parse(request.response)[1] != undefined)
        {
          displayMethodOutput(JSON.stringify(JSON.parse(request.response)[1]));
        }
      }
    }
  });
}

/**
 * stream device to cloud messages from IoT Hub via websocket, opened server side
 */
function emitdata()
{
  var device=getCookie('device-id');
  var hubConnectionString=getCookie('iothub-connection-string');
  if(device != "" && hubConnectionString != "")
  {
    var values =
    {
        "device-id": device,
        "iothub-connection-string": hubConnectionString
    };  
    sendRequest(values, "http://localhost:5000/hubmessages");
  }
  else
  {
    alert("You must set your device id and IoT Hub Connection string before running this method. This is done in the configurations page!");
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// camera-related methods

/**
 * display all current user set cameras on page load ./cameras
 */
function displayCameras()
{
  var cameraCookies=JSON.parse(getCookie('cameras'));
  var camerasList = $('#existing-cameras');
  $(camerasList)[0].innerHTML="";
  cameraCookies.forEach((cam) => 
  {
    var template = $('#created-camera-template').html();
    template = $(template).clone();
    var li = template[0];
    $(li).attr({ 'id': makeUniqueId() });

    var values_column=$(template)[0].getElementsByTagName('tr')[1];
    values_column.children[0].innerHTML=cam.name;
    values_column.children[1].innerHTML=cam.url;
    values_column.children[2].innerHTML=cam.username;
    values_column.children[3].innerHTML=cam.password;
    camerasList.append(template);
  });
  if ($(camerasList)[0].innerHTML=="")
  {
    $(camerasList)[0].innerHTML="You currently have no cameras set up";
  }
}

/**
 * submit the user-input camera values from client to server
 */
function submitCameras() 
{
  var camerasHtml = document.getElementById("camera-config");
  var cameras =
  {
    "camerasArray": []
  };
  for (var i = 0; i < camerasHtml.children.length; i++) 
  {
    var entries = camerasHtml.children[i].getElementsByTagName("input");
    cameras.camerasArray.push(
    {
      "name": entries[0].value,
      "url": entries[1].value,
      "username": entries[2].value,
      "password": entries[3].value
    })
  }

  //add camera to cookie. must json stringify for it to render properly
  var cameraCookies = [];
  getCookie('cameras').length <= 1 ?  cameraCookies=[] : cameraCookies = JSON.parse(getCookie('cameras'));
  
  var newCvalue = cameras.camerasArray.concat(cameraCookies); //combine current camera cookie array with new values from camera-config form(s)
  setCookie("cameras", JSON.stringify(newCvalue), 1);

  var existingCameras = $('#existing-cameras');
  existingCameras[0].innerHTML="";
  newCvalue.forEach((cam) => 
  {
    var template = $('#created-camera-template').html();
    template = $(template).clone();
    var li = template[0];
    $(li).attr({ 'id': makeUniqueId() });

    var values_column=$(template)[0].getElementsByTagName('tr')[1];
    values_column.children[0].innerHTML=cam.name;
    values_column.children[1].innerHTML=cam.url;
    values_column.children[2].innerHTML=cam.username;
    values_column.children[3].innerHTML=cam.password; //should be hidden?
    existingCameras.append(template);
  });
}

/** delete camera both from page and from cookies
 * htmlElement - the delete button, gets passed in on click
 */
function deleteCamera(htmlElement) 
{
  var cameraCookieMonster=JSON.parse(getCookie('cameras'));
  if(cameraCookieMonster.length>0)
  {
    var name = $(htmlElement).closest('table')[0].getElementsByTagName('tr')[1].children[0].innerText;
    cameraCookieMonster.forEach((cam) =>
     {
       if(cam.name==name){
        cameraCookieMonster.splice(cameraCookieMonster.indexOf(cam), 1);
       }
     })
     setCookie('cameras', JSON.stringify(cameraCookieMonster), 1);
  }
  deleteFromParentListItem(htmlElement);
  displayCameras();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// graph instance methods

/**set a graph instance
 * asks user for lots of parameters
 */
function setInstance()
{
  //get each of the parameters and their values
    var parametersObject=[];
    var parameters=document.getElementsByClassName("parameter-input");
    for(var param of parameters) 
    {
        if(param.value=="") param.value=param.getAttribute("placeholder");
        parametersObject.push({
            "name": param.getAttribute('id'),
            "value": param.value
        });
    };

    var instanceName=document.getElementById("instance-name-input").value;
    var topologyName=document.getElementById("instanceset-topology").getAttribute("name");

    //create the request object
    var payload = 
    {
        "@apiVersion": "1.0",
        "name": instanceName,
        "properties": 
        {
          "topologyName": topologyName,
          "description": "no description yet!",
          "parameters": parametersObject
        }
    }  

    invokeLVAMethod(createFullPayload("GraphInstanceSet", payload)).then((response) =>
    {
      if(JSON.parse(response).status < 250)
      {

      }
    })

    //reset the Set Graph Instance modal
    var obj=$('#parameter-list');

    //can't do get htmlElementent by id on a template
    obj[0].innerHTML="";
}

/** GraphInstanceSet: set up parameters! 
 * */  
function populateModalTemplate()
{
  //find the currently set graph topology
  var template=document.getElementById("myModal");

  var modalObjects=template.getElementsByClassName("modal-item");
  var content=template.getElementsByClassName("all-set-instance-content");
  content[0].style.visibility = "visible";
  let currentSelect=modalObjects[0]

  //for each topology display the name as option for user to set instance on
  Object.keys(graphTopologies).forEach((graphName) => 
  {
    currentSelect.innerHTML+="<option value="+graphName+">"+graphName+"</option>";
  })

      //add select menu for user to choose one of the current cameras
  var cameraNames = JSON.parse(getCookie('cameras'));
  currentSelect=modalObjects[2];
 
  //for each camera display the name as option for user to use in instance
  cameraNames.forEach((cam) =>
  {
    currentSelect.innerHTML+="<option value="+cam.name+">"+cam.name+"</option>";
  });
}

/**
 * Populates instance template with camera parameters based on user selection.
 * @param {camera name to load} htmlElement 
 */
function loadCameraParams(htmlElement)
{
  var cameras = JSON.parse(getCookie('cameras'));   
  var theChosenCamera;
  cameras.forEach((cam) =>
  {
    if(htmlElement.value==cam.name) theChosenCamera=cam;
  });

  document.getElementById("rtspUrl").value=theChosenCamera.url;
  document.getElementById("rtspUserName").value=theChosenCamera.username;
  document.getElementById("rtspPassword").value=theChosenCamera.password;    
}

/**
 * adds all the parameters and default values to the modal template after user selects a topology, while running set graph instance
 * @param {a graph topology} htmlElement 
 */
function loadTopologyParams(htmlElement)
{
  var mediaGraph = graphTopologies[htmlElement.value];
  document.getElementById("instanceset-topology").name=htmlElement.value;
  var obj=$('#parameter-list');

  //can't do get htmlElementent by id on a template
  obj[0].innerHTML="";

  //create new parameter template and add the default values in for each one
  mediaGraph.properties.parameters.forEach((parameter) => 
  {
    var parameterTemplate = $('#parameter-template').html();
    parameterTemplate= $(parameterTemplate).clone();
    parameterTemplate[0].getElementsByClassName("information")[0].innerHTML=parameter.name+": "+parameter.description;
    if(parameter.hasOwnProperty("default"))
    {
      parameterTemplate[0].getElementsByClassName("parameter-input")[0].setAttribute("placeholder", parameter.default);
    }
    parameterTemplate[0].getElementsByClassName("parameter-input")[0].setAttribute("id", parameter.name);
    obj[0].appendChild(parameterTemplate[0]);
  });
}