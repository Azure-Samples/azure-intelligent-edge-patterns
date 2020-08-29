const { EventHubConsumerClient } = require('@azure/event-hubs');
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

/**
* get messages coming from IoT Hub
*/
class EventHubReader 
{
  constructor(iotHubConnectionString, consumerGroup) 
  {
    this.iotHubConnectionString = iotHubConnectionString;
    this.consumerGroup = consumerGroup;

  }

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

  // Close connection to Event Hub.
  async stopReadMessage() 
  {
    await this.subs.close();
    await this.consumerClient.close();
    console.log("exiting recieve hub messages");
  }
}

module.exports = EventHubReader;