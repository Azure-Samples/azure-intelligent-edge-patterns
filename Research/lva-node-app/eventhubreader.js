/**
 * This file contains the class used to get and process iot hub messages via Event Hub
 * @fileoverview
 * @requires module:event-hubs 
 * @requires module:iot-hub-connection-string
 */

const { EventHubConsumerClient } = require('@azure/event-hubs');

/**
* get messages coming from IoT Hub
* @class
*/
class EventHubReader
{
    /**
     * @constructor
     * @param {string} eventHubConnectionString - event hub connection string in standard format (IOTHUB_ENDPOINT)
     * @param {string} consumerGroup - consumer group, typically Default
     */
    constructor(eventHubConnectionString, consumerGroup)
    {
        this.eventHubConnectionString = eventHubConnectionString;
        this.consumerGroup = consumerGroup;
    }

    /**
     * starts the process of reading messages from Iot Hub by creating an Event Hubs connection string
     * @param {any} startReadMessageCallback - callback function
     */
    startReadMessage(startReadMessageCallback)
    {
        try
        {
            this.consumerClient = new EventHubConsumerClient(this.consumerGroup, this.eventHubConnectionString);
            console.log('Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.');
            this.subs = this.consumerClient.subscribe(
                {
                    processEvents: (events) =>
                    {
                        for (let i = 0; i < events.length; ++i)
                        {
                            startReadMessageCallback(
                                events[i].body,
                                events[i].enqueuedTimeUtc,
                                events[i].systemProperties["iothub-connection-device-id"]);
                        }
                    },
                    processError: (error) =>
                    {
                        console.error(error.message || error);
                    }
                });
        } catch (error)
        {
            console.error(error.message || error);
        }
    }

    /**
     * closes connection to Event Hub
     * @returns {Promise<any>} - resolve if successfully closed consumer client and subscriber
     */
    stopReadMessage()
    {
        return new Promise((resolve, reject) =>
        {
            this.subs.close().then(() =>
            {
                this.consumerClient.close().then(()=>
                {
                    console.log("Closing event hub connection");
                    resolve();
                }).catch(() =>
                {
                    reject("Could not close EventHubReader consumer client");
                })
            }).catch(() =>
            {
                reject("Could not close EventHubReader subscriber");
            })
        })

    }
}

module.exports = EventHubReader;