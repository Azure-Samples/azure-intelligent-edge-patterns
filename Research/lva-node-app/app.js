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
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const Client = iothub.Client;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(express.static('public/pages'))

/**
* @global
*/
global.DEVICE_ID = "";
global.MODULE_ID = "lvaEdge";
global.IOTHUB_CONNECTION_STRING = "";
global.IOTHUB_ENDPOINT = "";

var cameras = {};
var eventHubReader=undefined;

const PORT = 5000;

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
* send client camera variable upon request 
*/
app.get('/cameraVariable', function (req, res)
{
    console.log("User requested cameras from server");
    let cameraVar =
    {
        cameras: cameras
    };
    res.json(cameraVar);
})

/**
* update cameras when sent by user
* modifying existing variable, thus using a PUT request
*/
app.put('/cameraVariable', function (req, res)
{
    cameras = req.body.cameras;
    res.end();
})

/**
* start sending live stream hub messages to client via websocket 
*/
app.get('/hubMessages', function (req, res)
{
    if (validCredentialsAreSet(res) && eventHubReader == undefined)
    {
        receiveHubMessages();
    }
    else
    {
        res.status(400).send("There is already a connection open to the IoT Hub!");
    }
    res.end();
})

/**
 * stop receiving messages from iot hub
 */
app.post('/stopMessages', function (req, res)
{
    if(eventHubReader == undefined)
    {
        res.status(400).send("No connection open");   
    }
    else
    {
        eventHubReader.stopReadMessage();
        res.end();
        eventHubReader = undefined;
    }
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// handle POST requests

/**
 * invoke LVA methods handler
 */
app.post('/runMethod', function (req, res)
{
    //only run if credentials are set, otherwise validCredentialsAreSet method will send res.send(error message)
    if (validCredentialsAreSet(res))
    {
        let methodName = req.body.methodName;
        invokeLVAMethod(req, res).then(response =>
        {
            let obj = [{ method: methodName }, response.result];
            //send results of invoking the method back to the client
            res.json(obj);
        }).catch((error) =>
        {
            console.error(error.message);
            res.status(400).send(error.message);
        });
    }
})

/**
* this method connects to the IoTHub, and lists the currently running  modules on your device. Ensures connection works properly!
*/
app.post('/connectToIotHub', function (req, res)
{
    setConfigs(req, res).then(() =>
    {
        let registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
        registry.getModulesOnDevice(DEVICE_ID).then((response) =>
        {
            let modules = "";
            //get modules on device
            for (let i = 0; i < response.responseBody.length; i++)
            {
                modules += response.responseBody[i].moduleId + " ";
                console.log(response.responseBody[i].moduleId);
            }
            //on success
            res.send("Successfully connected to your IoTHub. Found the following modules on your device: " + modules);
        }).catch((reason) =>
        {
            console.error(reason);
            res.status(400).send("Unable to connect to device. Error response: " + JSON.parse(reason.responseBody).Message);
        });
    }).catch((error) =>
    {
        console.error(error);
        res.status(400).send("Error: " + error);
    })
})


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// defined functions

/**
* set device ID and IoTHub connection string
* try to connect to the iot hub to make sure that the passed in values are valid!
* @returns {Promise<any>} - Promise to resolve/reject based on validity of Device ID and Iot Hub Connection String
*/
function setConfigs(req)
{
    return new Promise((resolve, reject) =>
    {
        DEVICE_ID = req.body["device-id"];
        IOTHUB_CONNECTION_STRING = req.body["iothub-connection-string"];
        if (DEVICE_ID == "" || IOTHUB_CONNECTION_STRING == "")
        {
            DEVICE_ID = "";
            IOTHUB_CONNECTION_STRING = "";
            reject("You must provide both your device ID and your Iot Hub Connection String");
        }
        convertIotHubToEventHubsConnectionString(IOTHUB_CONNECTION_STRING).then((eventhubString) =>
        {
            IOTHUB_ENDPOINT = eventhubString;
            resolve();
        }).catch((error) =>
        {
            //reset values on failure
            console.error(error);
            DEVICE_ID = "";
            IOTHUB_CONNECTION_STRING = "";
            reject(error.message);
        });
    })
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
            } catch (error)
            {
                console.error(error);
            }
        }
    });
};

/**
* function that actually broadcasts hub messages to websocket
*/
function receiveHubMessages()
{
    const consumerGroup = "$Default";
    eventHubReader = new EventHubReader(IOTHUB_ENDPOINT, consumerGroup);
    eventHubReader.startReadMessage((message, date, deviceId) =>
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
        } catch (error)
        {
            console.error('Error broadcasting: [%s] from [%s].', error, message);
        }
    });
}

/**
* checks that the iothub_connection_string and device ID are set. If not, responds to client wth 404 and error message
* @param {XMLHttpRequestResponseType} res - request response
* @returns {boolean} - true if credential are set
*/
function validCredentialsAreSet(res)
{
    if (IOTHUB_CONNECTION_STRING == "" || DEVICE_ID == "" || IOTHUB_ENDPOINT == "")
    {
        res.status(404).send("Please set your IoT Hub Connection String and Device ID!");
        return false;
    }
    return true;
}

/**
* this function invokes a direct method on the lvaEdge module.
* @param {XMLHttpRequest} req - request option
* @returns {Promise<ResultWithHttpResponse<any>>}
*/
function invokeLVAMethod(req)
{
    let client = Client.fromConnectionString(IOTHUB_CONNECTION_STRING);
    return client.invokeDeviceMethod(DEVICE_ID, MODULE_ID,
        {
            methodName: req.body.methodName,
            payload: req.body.Payload,
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