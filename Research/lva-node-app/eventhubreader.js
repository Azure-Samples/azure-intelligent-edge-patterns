/**
 * This file contains the class used to get and process iot hub messages via Event Hub
 * @fileoverview
 * @requires module:event-hubs 
 * @requires module:iot-hub-connection-string
 */

const { EventHubConsumerClient } = require('@azure/event-hubs');
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

/**
* get messages coming from IoT Hub
* @class
*/
class EventHubReader 
{

  /**
   * @constructor
   * @param {string} iotHubConnectionString - iot hub connection string in standard format
   * @param {string} consumerGroup - consumer group, typically Default
   */
  constructor(iotHubConnectionString, consumerGroup) 
  {
    this.iotHubConnectionString = iotHubConnectionString;
    this.consumerGroup = consumerGroup;
  }

  /**
   * starts the process of reading messages from Iot Hub by creating an Event Hubs connection string
   * @async
   * @param {any} startReadMessageCallback - callback function
   */
  async startReadMessage(startReadMessageCallback) 
  {
    try 
    {
      const eventHubConnectionString = await convertIotHubToEventHubsConnectionString(this.iotHubConnectionString);
      this.consumerClient = new EventHubConsumerClient(this.consumerGroup, eventHubConnectionString);
      console.log('Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.');

      this.subs = this.consumerClient.subscribe(
      {
        processEvents: (events, context) => 
        {
          for (let i = 0; i < events.length; ++i) 
          {
            startReadMessageCallback(
              events[i].body,
              events[i].enqueuedTimeUtc,
              events[i].systemProperties["iothub-connection-device-id"]);
          }
        },
        processError: (err, context) => 
        {
          console.error(err.message || err);
        }
      });
      
      console.log("success");

    } catch (ex) 
    {
      console.error(ex.message || ex);
    }
  }

  /**
   * closes connection to Event Hub
   * @async
   */
  async stopReadMessage() 
  {
    await this.subs.close();
    await this.consumerClient.close();
    console.log("Closing Event Hub connection");
  }
}

module.exports = EventHubReader;