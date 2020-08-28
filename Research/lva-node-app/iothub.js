/** ensure valid connection, get modules on device */
module.exports.iothubconnection = (req, res, next) => {
    var iothub = require('azure-iothub');
    var registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
    return registry.getModulesOnDevice(DEVICE_ID);
};


const { EventHubConsumerClient } = require("@azure/event-hubs");

async function listen(handleEvent) {
    const client = new EventHubConsumerClient(
        "$default",
        IOTHUB_ENDPOINT
    );

    const properties = await client.getEventHubProperties();
    console.log(properties);

    const subs = [];

    for (let partitionId in properties.partitionIds) {

        let s = client.subscribe(partitionId, {
            processInitialize: async (context) => {
                console.log(`init partitionId ${partitionId}`);
            },
            processEvents: async (events, context) => {
                for (const event of events) {
                    handleEvent(event.body.data);
                }
            },
            processError: async (err, context) => {
                console.log(partitionId);
                console.error(err);
            },
            processClose: async (context) => {
                console.log(`close partitionId${partitionId}`);
                console.dir(context);
            }
        }, {
            maxWaitTimeInSeconds: 1
        });
        subs.push(s);
    }
}

exports.listen = listen;