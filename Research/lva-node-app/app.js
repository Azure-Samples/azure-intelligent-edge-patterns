const express = require('express');
const WebSocket = require('ws');
const app = express();
const server= require('http').createServer(app);
const wss = new WebSocket.Server({server});
const EventHubReader = require('./eventhubreader.js');
const iothub = require('./iothub.js'); 

//invoke direct methods on lvaEdge module
const invokeMethods = require('./invokemethods.js'); 
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

//TODO stop receiving hub messages. stop reading messages...

// Global Variables!
// maybe change the mutables to not being global?
global.graphInstances={};
global.graphTopologies={};
global.cameras={};

global.DEVICE_ID="";
global.MODULE_ID="lvaEdge";
global.IOTHUB_CONNECTION_STRING="";
global.IOTHUB_ENDPOINT="";

const PORT=5000;
const bodyParser = require('body-parser');
const { request, response } = require('express');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'))



// render the html pages. the '/<name>' is what the url extension will look like in the browser
app.get('/', function (req, res) {
    res.render('index.html')
})
app.get('/mediagraph', function (req, res) {
    res.render('mediagraph.html')
})
app.get('/configuration', function (req, res) {
    res.render('configuration.html')
})
app.get('/cameras', function (req, res) {
    res.render('cameras.html')
})
app.get('/output', function (req, res) {
    res.render('output.html')
})

/**
* send client global variables upon request 
*/
app.get('/getglobals', function (req, res) {
  console.log("get globals get function!");
  var globals = [
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
* set global variables when passed by user 
*/
function setGlobals(req, res)
{
  console.log("received globals");
  console.log(req.body);
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
  console.log(graphInstances);
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
 * this method connects to the IoTHub, and lists the currently running  modules on your device. Ensures connection works properly!
 * Here be dragons :) I double-promise I won't eat all the cookies
 */
app.post('/connectToIotHub', function (req, res) 
{
    setConfigs(req, res);
    iothub.iothubconnection(req, res).then(response => { //.then is promise resolved callback. must do here because invokeLVAMethod is async
      var modules="";
        for(var i=0; i<response.responseBody.length; i++)
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

/**update global variables when sent by user*/
app.post('/globals', function (req, res)
{
  setGlobals(req, res);
  res.send();
})

/**start sending live stream hub messages to client via websocket */
app.get('/hubMessages', function(req, res)
{
  if (!validCredentialsAreSet(res))
  {
    return;
  }
  else
  {
    receiveHubMessages();
  }  
})

/** 
* broadcast used for sending IoT Hub message data in a live stream 
*/
wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          console.log(`Broadcasting data ${data}`);
          client.send(data);
        } catch (e) {
          console.error(e);
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
      const eventHubReader = new EventHubReader(IOTHUB_CONNECTION_STRING, consumerGroup);
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

              console.log(JSON.stringify(payload));
              wss.broadcast(JSON.stringify(payload));
            } catch (err) 
            {
              console.error('Error broadcasting: [%s] from [%s].', err, message);
            }
          });
      })().catch();
}

/**
 * checks that the iothub_connection_string and device ID are set. If not, responds to client wth 404 and error message
 * @param {request response object} res 
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

//invoke LVA methods handler
app.post('/runmethod', function (req, res) 
{ 
    if (!validCredentialsAreSet(res)) return;
    var methodName=req.body.methodName;
    invokeMethods.invokeLVAMethod(req, res).then(response => 
    {
      var obj=[{method: methodName}, response.result];
      //send results of invoking the method back to the client
      res.send(obj); 
    }).catch(error =>
    {
      console.error(error.message);
      res.status(400).send(error.message);
    });  
})

/** on page error */
app.use(function (req, res, next) 
{
    res.status(404).send("404 not found. :(");
})

server.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));