/**
 * @fileoverview
 * This is the main server-side logic that establishes the server, websocket, imports modules,
 * and handles server-side functionality
 */

/**
 * @requires module:express
 * @requires module:ws
 * @requires module:eventhubreader
 * @requires module:azure-iothub
 * @requires module:body-parser 
 * @requires module:express
 * @requires module:iot-hub-connection-string
 */
const express = require('express');
const WebSocket = require('ws');
const EventHubReader = require('./eventhubreader.js');
const iothub = require('azure-iothub');
const bodyParser = require('body-parser');
const { request, response } = require('express');
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

const app = express();
const server= require('http').createServer(app);
const wss = new WebSocket.Server({server});
const Client = iothub.Client;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(express.static('public/pages'))

/**
 * @global
 */
global.DEVICE_ID="";
global.MODULE_ID="lvaEdge";
global.IOTHUB_CONNECTION_STRING="";
global.IOTHUB_ENDPOINT="";

var graphInstances={};
var graphTopologies={};
var cameras={};
var eventHubReader;

const PORT=5000;

/**
 * For all following declarations of function(req, res):
 * @param {XMLHttpRequest} req - request object
 * @param {XMLHttpRequestResponseType} res - request response object
 */

// render the html pages. the '/<name>' is what the url extension will look like in the browser
app.get('/', function (req, res) 
{
    res.render('index.html')
})
app.get('/mediagraph', function (req, res) 
{
    res.render('mediagraph.html')
})
app.get('/configuration', function (req, res) 
{
    res.render('configuration.html')
})
app.get('/cameras', function (req, res) 
{
    res.render('cameras.html')
})
app.get('/output', function (req, res) 
{
    res.render('output.html')
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// handle GET requests

/**
* send client global variables upon request 
* @returns {void}
*/
app.get('/getglobals', function (req, res) 
{
  console.log("get globals get function!");
  let globals = 
  [
    {
      "name": "graphInstances",
      "value": graphInstances
    },
    {
      "name": "graphTopologies",
      "value": graphTopologies
    },
    {
      "name": "cameras",
      "value": cameras
    }
  ];
  res.send(JSON.stringify(globals));
})

/**
* start sending live stream hub messages to client via websocket 
* @returns {void}
*/
app.get('/hubMessages', function(req, res)
{
  if (!validCredentialsAreSet(res))
  {
    return;
  }
  else
  {
    receiveHubMessages();
    //always close requests
    res.send();
  }  
})

/**
 * stop receiving messages from iot hub
 * @returns {void}
 */
app.get('/stopMessages', function(req, res)
{
  eventHubReader.stopReadMessage();
  res.send();
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// handle POST requests

/**
 * invoke LVA methods handler
 * @returns {void}
 */
app.post('/runmethod', function (req, res) 
{ 
    if (!validCredentialsAreSet(res))
    {
      return;
    }
    let methodName=req.body.methodName;
    invokeLVAMethod(req, res).then(response => 
    {
      let obj=[{method: methodName}, response.result];
      //send results of invoking the method back to the client
      res.send(obj); 
    }).catch(error =>
    {
      console.error(error.message);
      res.status(400).send(error.message);
    });  
})

/**
* this method connects to the IoTHub, and lists the currently running  modules on your device. Ensures connection works properly!
* Here be dragons :) I double-promise
*/
app.post('/connectToIotHub', function (req, res) 
{
    setConfigs(req, res);
    iotHubConnection(req, res).then(response => { //.then is promise resolved callback. must do here because invokeLVAMethod is async
      let modules="";
        for(let i=0; i<response.responseBody.length; i++)
        {
          modules+=response.responseBody[i].moduleId+" ";
          console.log(response.responseBody[i].moduleId);
        }
        res.send("Successfully connected to your IoTHub. Found the following modules on your device: "+modules);
    }, reason =>  //on error send error response
    {
      console.log(reason);
      res.send("Unable to connect to device. Error response: "+ JSON.parse(reason.responseBody).Message);
    });          
}) 


/**
* update global variables when sent by user
*/
app.post('/globals', function (req, res)
{
  setGlobals(req, res);
  res.send();
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// defined functions

/**
* set global variables when passed by user 
*/
function setGlobals(req, res)
{
  for (let i in req.body)
  {
    let name=req.body[i].name;
    switch(name)
    {
      case 'graphInstances':
        graphInstances=req.body[i].value;
        break;
      case 'graphTopologies':
        graphTopologies=req.body[i].value;
        break;
      case 'cameras':
        cameras=req.body[i].value;
        break;
    }
  }
}

/**
* set device ID and IoTHub connection string
* try to connect to the iot hub to make sure that the passed in values are valid!
*/
function setConfigs(req, res)
{
  DEVICE_ID=req.body["device-id"];
  IOTHUB_CONNECTION_STRING=req.body["iothub-connection-string"];
  convertIotHubToEventHubsConnectionString(IOTHUB_CONNECTION_STRING).then((eventhubString) =>
  {
    IOTHUB_ENDPOINT = eventhubString;
  }).catch((error) =>
  {
    console.error(error);
    res.send(error.message);
  });
}


/** 
* broadcast used for sending IoT Hub message data in a live stream 
* @param {any} data - data to send through websocket
*/
wss.broadcast = (data) => 
{
    wss.clients.forEach((client) => 
    {
      if (client.readyState === WebSocket.OPEN) 
      {
        try 
        {
          client.send(data);
        } catch (er) 
        {
          console.error(er);
        }
      }
    });
};

/**
* function that actually broadcasts hub messages to websocket
*/
async function receiveHubMessages() 
  {
      const consumerGroup = "$Default"; // name of the default consumer group
      eventHubReader = new EventHubReader(IOTHUB_CONNECTION_STRING, consumerGroup);
      (async () => 
      {
          await eventHubReader.startReadMessage((message, date, deviceId) => 
          {
            try 
            {
              const payload = 
              {
                IotData: message,
                MessageDate: date || Date.now().toISOString(),
                DeviceId: deviceId,
              };

              wss.broadcast(JSON.stringify(payload));
            } catch (err) 
            {
              console.error('Error broadcasting: [%s] from [%s].', err, message);
            }

          });
      })().catch();
}

/**
 * Connects to IoT Hub and returns a list of currently running modules 
 * @returns {Promise<ResultWithHttpResponse<Module[]>>}
 */
function iotHubConnection(req, res)
{
    let registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
    return registry.getModulesOnDevice(DEVICE_ID);
};

/**
* checks that the iothub_connection_string and device ID are set. If not, responds to client wth 404 and error message
* @param {XMLHttpRequestResponseType} res - request response
* @returns {boolean} - true if credential are set
*/
function validCredentialsAreSet(res)
{
  if (IOTHUB_CONNECTION_STRING == "" || DEVICE_ID == "")
  {
    res.status(404).send("Please set your IoT Hub Connection String and Device ID!");
    return false;
  }
  return true;
}

/**
* this function invokes a direct method on the lvaEdge module.
 * @returns {Promise<ResultWithHttpResponse<any>>}
*/
function invokeLVAMethod(req, res)
{
    let client = Client.fromConnectionString(IOTHUB_CONNECTION_STRING);

    return client.invokeDeviceMethod(DEVICE_ID, MODULE_ID,
        {
            methodName: req.body.methodName,
            payload: req.body.Payload,
            responseTimeoutInSeconds: 200,
            connectTimeoutInSeconds: 2
        });
};

/** 
* on page error 
*/
app.use(function (req, res) 
{
    res.status(404).send("404 not found. :(");
})

server.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));