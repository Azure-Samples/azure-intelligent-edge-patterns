namespace objectCounter
{
    using System;
    using System.IO;
    using System.Collections.Generic;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Shared;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;

    using Newtonsoft.Json;

    class Program
    {
        static string objectTag = "";
        static double objectConfidence = 0;        

        static void Main(string[] args)
        {
            Init().Wait();

            // Wait until the app unloads or is cancelled
            var cts = new CancellationTokenSource();
            AssemblyLoadContext.Default.Unloading += (ctx) => cts.Cancel();
            Console.CancelKeyPress += (sender, cpe) => cts.Cancel();
            WhenCancelled(cts.Token).Wait();
        }

        /// <summary>
        /// Handles cleanup operations when app is cancelled or unloads
        /// </summary>
        public static Task WhenCancelled(CancellationToken cancellationToken)
        {
            var tcs = new TaskCompletionSource<bool>();
            cancellationToken.Register(s => ((TaskCompletionSource<bool>)s).SetResult(true), tcs);
            return tcs.Task;
        }

        /// <summary>
        /// Initializes the ModuleClient and sets up the callback to receive
        /// messages containing temperature information
        /// </summary>
        static async Task Init()
        {
            MqttTransportSettings mqttSetting = new MqttTransportSettings(TransportType.Mqtt_Tcp_Only);
            ITransportSettings[] settings = { mqttSetting };

            // Open a connection to the Edge runtime
            ModuleClient ioTHubModuleClient = await ModuleClient.CreateFromEnvironmentAsync(settings);
            await ioTHubModuleClient.OpenAsync();
            Console.WriteLine("IoT Hub module client initialized.");

            // Register callback to be called when a message is received by the module
            await ioTHubModuleClient.SetInputMessageHandlerAsync("detectedObjects", CountObjects, ioTHubModuleClient);

            // Register callback to be called when desired property changes
            await ioTHubModuleClient.SetDesiredPropertyUpdateCallbackAsync(OnDesiredPropertyChanged, ioTHubModuleClient);

            Twin moduleTwin = ioTHubModuleClient.GetTwinAsync().GetAwaiter().GetResult();
            ReadDesiredProperties(moduleTwin.Properties.Desired);
        }

        private static void ReadDesiredProperties(TwinCollection desiredProperties)
        {
            if (desiredProperties.Contains("objectTag"))
            {
                objectTag = desiredProperties["objectTag"];
            }

            if (desiredProperties.Contains("objectConfidence"))
            {
                objectConfidence = desiredProperties["objectConfidence"];            
            }

            Console.WriteLine("objectTag set to " + objectTag);
            Console.WriteLine("objectConfidence set to " + objectConfidence.ToString());            
        }

        private static async Task OnDesiredPropertyChanged(TwinCollection desiredProperties, object userContext)
        {                        
            try
            {     
                ReadDesiredProperties(desiredProperties);

                ModuleClient ioTHubModuleClient = (ModuleClient)userContext;
                
                TwinCollection reportedProperties = new TwinCollection();
                reportedProperties["DateTimeLastDesiredPropertyChangeReceived"] = DateTime.Now;

                await ioTHubModuleClient.UpdateReportedPropertiesAsync(reportedProperties).ConfigureAwait(false);
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception in OnDesiredPropertyChanged");
                Console.WriteLine(ex);
            }
        }    


        /// <summary>
        /// This method is called whenever the module is sent a message from the EdgeHub.         
        /// </summary>
        static async Task<MessageResponse> CountObjects(Message message, object userContext)
        {            
            var moduleClient = userContext as ModuleClient;
            if (moduleClient == null)
            {
                throw new InvalidOperationException("UserContext doesn't contain " + "expected values");
            }

            byte[] messageBytes = message.GetBytes();
            string messageString = Encoding.UTF8.GetString(messageBytes);
            //Console.WriteLine($"Received message: Body: [{messageString}]");

            if (!string.IsNullOrEmpty(messageString))
            {
                int count = 0;
                dynamic inputMessage = JsonConvert.DeserializeObject(messageString);
                dynamic detectedObjects = inputMessage.inferences;
                
                if (detectedObjects != null)
                {
                    foreach (dynamic inference in detectedObjects)
                    {
                        dynamic entity = inference["entity"];
                        dynamic tag = entity["tag"];

                        if ((tag["value"] == objectTag) && (tag["confidence"] > objectConfidence))
                        {
                            count++;
                        }
                    }
                }
                
                if (count > 0)
                {
                    string outputMsgString = JsonConvert.SerializeObject(new Dictionary<string, int>() {
                                                                                { "count", count }
                                                                            });
                    byte[] outputMsgBytes = System.Text.Encoding.UTF8.GetBytes(outputMsgString);                

                    using (var outputMessage = new Message(outputMsgBytes))
                    {
                        //outputMessage.Properties.Add("eventType", "Microsoft.Media.Graph.Signaling.SignalGateTrigger");
                        
                        string subject = message.Properties["subject"];
                        string graphInstanceSignature = "/graphInstances/";
                        if (subject.IndexOf(graphInstanceSignature) == 0)
                        {
                            int graphInstanceNameIndex = graphInstanceSignature.Length;
                            int graphInstanceNameEndIndex = subject.IndexOf("/", graphInstanceNameIndex);
                            string graphInstanceName = subject.Substring(0, graphInstanceNameEndIndex);
                            //outputMessage.Properties.Add("eventTarget", graphInstanceName);

                            outputMessage.Properties.Add("eventTime", message.Properties["eventTime"]);
                            await moduleClient.SendEventAsync("objectCountTrigger", outputMessage);
                        }

                    
                       // Console.WriteLine("Message sent: " + outputMsgString);
                    }
                }
                else
                {
                    //Console.WriteLine("No message sent as object count was zero");
                }
            }
            return MessageResponse.Completed;
        }
    }
}
