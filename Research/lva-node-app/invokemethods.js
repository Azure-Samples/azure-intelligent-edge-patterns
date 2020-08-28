/**
 * this function invokes a direct method on the lvaedge module. returns a promise
 */

module.exports.invokeLVAMethod = (req, res, next) => 
{
    var Client = require('azure-iothub').Client;
    var client = Client.fromConnectionString(IOTHUB_CONNECTION_STRING);

    return client.invokeDeviceMethod(DEVICE_ID, MODULE_ID,
        {
            methodName: req.body.methodName,
            payload: req.body.Payload,
            responseTimeoutInSeconds: 200,
            connectTimeoutInSeconds: 2
        });
};