/** ensure valid connection, get modules on device */
module.exports.iothubconnection = (req, res, next) => {
    var iothub = require('azure-iothub');
    var registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
    return registry.getModulesOnDevice(DEVICE_ID);
};