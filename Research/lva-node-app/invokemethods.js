/**
 * this function invokes an
 */

//use strict means you cannot use undeclared variables
module.exports.invokeLVAMethod = (req, res, next) => 
{
    var Client = require('azure-iothub').Client;
    var client = Client.fromConnectionString(IOTHUB_CONNECTION_STRING);

    return client.invokeDeviceMethod(req.body.deviceId, req.body.moduleId,
        {
            methodName: req.body.methodName,
            payload: req.body.Payload,
            responseTimeoutInSeconds: 200,
            connectTimeoutInSeconds: 2
        });
};