'use strict';
module.exports.invokeLVAMethod = (req, res, next) => {
    var Client = require('azure-iothub').Client;
    var connectionString = 'HostName=teamlvahub.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=/8nyius4kfiluEWMcqABzgEb5blsevlHsTbZWWZ3QG8=';
    var client = Client.fromConnectionString(connectionString);

    return client.invokeDeviceMethod(req.body.deviceId, req.body.moduleId,
        {
            methodName: req.body.methodName,
            payload: req.body.Payload,
            responseTimeoutInSeconds: 200,
            connectTimeoutInSeconds: 2
        });
};