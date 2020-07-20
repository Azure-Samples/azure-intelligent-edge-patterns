using Microsoft.Azure.EventHubs;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.System.Threading;

namespace ServiceListener
{
    public sealed class GapListenerHub : ServicePointBase
    {
        public event GapDetection GapDetectionEvent;

        List<PartitionReceiver> receivers = new List<PartitionReceiver>();

        Dictionary<string, UploadMessage> allUploads = new Dictionary<string, UploadMessage>();
        ILookup<string, RecognitionMessage> allRecognitions = default(ILookup<string, RecognitionMessage>);

        EventHubClient eventHubClient;
        bool isInitialized = false;
        CloudStorageAccount storageAccount;
        CloudBlobClient cloudBlobClient;
        CloudBlobContainer cloudBlobContainer;
        byte[] blobData;
        string cameraId;

        bool IsRecognitionMessage(EventData @event) => @event.Properties[GapConfig.SchemaKey] as string == GapConfig.RecognitionSchema;

        bool IsUploadMessage(EventData @event) => @event.Properties[GapConfig.SchemaKey] as string == GapConfig.UploadSchema;

        bool IsGapRelatedEvent(EventData ed) =>
                ed.Properties.ContainsKey(GapConfig.SchemaKey)
                && (IsRecognitionMessage(ed) || IsUploadMessage(ed));

        public GapListenerHub(int pulseSec, string cameraId) : base(cameraId, pulseSec)
        {
            // preallocate to minimize thrashing
            blobData = new byte[GapConfig.BlobMaxSize];
            this.cameraId = base.url;
        }

        static object lockObj = new object();

        public override async void StartListening()
        {
            try
            {
                var connectionString =
                     new EventHubsConnectionStringBuilder(
                                 new Uri(GapConfig.EventHubsCompatibleEndpoint),
                                 GapConfig.EventHubsCompatiblePath,
                                 GapConfig.IotHubSasKeyName,
                                 GapConfig.IotHubSasKey);

                eventHubClient = EventHubClient.CreateFromConnectionString(connectionString.ToString());

                // Create a PartitionReciever for each partition on the hub.
                var runtimeInfo = await eventHubClient.GetRuntimeInformationAsync();
                var d2cPartitions = runtimeInfo.PartitionIds;

                // TODO: listening on partition 0 only. 
                receivers =
                    d2cPartitions
                        .Select(d2c => eventHubClient.CreateReceiver("$Default", d2c, EventPosition.FromEnqueuedTime(DateTime.Now)))
                        .ToList();

                listenerTimer = ThreadPoolTimer.CreatePeriodicTimer(BackgoundListen, timerPeriod);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.ToString());
            }
        }

        public override void BackgoundListen(ThreadPoolTimer timer)
        {
            List<Task> tasks = new List<Task>();
            //Run tasks with cancellation
            foreach (var receiver in receivers)
            {
                tasks.Add(ReceiveMessages(receiver));
            }

            Task.WaitAll(tasks.ToArray());
        }

        async Task ReceiveMessages(PartitionReceiver eventHubReceiver)
        {
            try
            {
                var events = await eventHubReceiver.ReceiveAsync(100);

                if (events == null) { return; }

                var imageMessages = events.Where(IsGapRelatedEvent)
                    .GroupBy(ed => ed.Properties[GapConfig.SchemaKey] as string)
                    .ToDictionary(gr => gr.Key, gr => gr.Select(ed => Encoding.UTF8.GetString(ed.Body.Array)).ToList());

                if (imageMessages.Count == 0) { return; }

                string lastRecognizedTime = string.Empty;
                List<string> imagesAndInferencesTimes = new List<string>();
                List<RecognitionMessage> latestRecognition = new List<RecognitionMessage>();

                // we are modifying a couple of globals, so synchronize.
                lock (lockObj)
                {
                    byte[] image = null;

                    // we try to get gap-related messages so we can then match upload 
                    // to recognion events
                    imagesAndInferencesTimes = ParseGapRelatedEvents(imageMessages);

                    if (imagesAndInferencesTimes.Count == 0)
                    {
                        // nothing was detected we should still display the image
                        if (allUploads[allUploads.Keys.Max()].featureCount == 0)
                        {
                            image = DownloadBlob(allUploads[allUploads.Keys.Max()]);
                            FireGapDetectionAndCleanup(image, new List<AbsoluteBoundingRect>());
                        }
                        return;
                    }

                    // we will get the latest. Date-time in Zulu so no need for conversions to determine max (latest) datetime
                    lastRecognizedTime = imagesAndInferencesTimes.Max();
                    latestRecognition = allRecognitions[lastRecognizedTime].ToList();

                    // we did not get all the recognitions
                    if (latestRecognition.Count < allUploads[lastRecognizedTime].featureCount) { return; }


                    // we could do this asynchronously but we are on a threadpool anyway
                    image = DownloadBlob(allUploads[lastRecognizedTime]);
                    var recogRects =
                        latestRecognition
                        .Select(lr => new AbsoluteBoundingRect
                        {
                            X = lr.bbxmin,
                            Y = lr.bbymin,
                            W = lr.bbxmax - lr.bbxmin,
                            H = lr.bbymax - lr.bbymin
                        }).ToList();

                    FireGapDetectionAndCleanup(image, recogRects);

                }

            }
            catch (Exception e)
            {
                Debug.WriteLine($"Gap Detection: {e.Message}");
            }
        }

        private void FireGapDetectionAndCleanup(byte[] image, List<AbsoluteBoundingRect> recogRects)
        {
            // Cleanup!
            allRecognitions = default(ILookup<string, RecognitionMessage>);
            allUploads.Clear();

            // and finally fire!
            GapDetectionEvent?.Invoke(image, recogRects);
        }

        private void Initialize()
        {
            if (!isInitialized)
            {
                storageAccount = CloudStorageAccount.Parse(GapConfig.ContainerConnectionString);
                cloudBlobClient = storageAccount.CreateCloudBlobClient();
                cloudBlobContainer = cloudBlobClient.GetContainerReference(GapConfig.ContainerName);
                isInitialized = true;
            }
        }

        private byte[] DownloadBlob(UploadMessage lastRecognized)
        {
            Initialize();
            string name = $"{lastRecognized.cameraId}/{lastRecognized.time}.{lastRecognized.type}";

            var blockBlob = cloudBlobContainer.GetBlockBlobReference(name);
            var bytesDownloaded = blockBlob.DownloadToByteArray(blobData, 0);

            return blobData.Take(bytesDownloaded).ToArray();
        }

        // Get upload events, recognition events, and match them
        // The "time" field of each event message body is a unique key to match on
        List<string> ParseGapRelatedEvents(Dictionary<string, List<string>> imageMessages)
        {
            Dictionary<string, UploadMessage> uploads = null;
            ILookup<string, RecognitionMessage> recognitions = null;

            if (imageMessages.ContainsKey(GapConfig.UploadSchema))
            {
                uploads = imageMessages[GapConfig.UploadSchema]
                    .Select(JsonConvert.DeserializeObject<UploadMessage>)
                    .Where(up => up.cameraId == cameraId)
                    .ToDictionary(um => um.time, um => um);
                allUploads = allUploads.Concat(uploads).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
            }

            if (imageMessages.ContainsKey(GapConfig.RecognitionSchema))
            {
                recognitions = imageMessages[GapConfig.RecognitionSchema]
                    .Select(JsonConvert.DeserializeObject<RecognitionMessage>)
                    .Where(up => up.cameraId == cameraId)
                    .ToLookup(rm => rm.time);

                // set or concatenate with previously obtained recognitions
                switch (allRecognitions)
                {
                    case default(ILookup<string, RecognitionMessage>):
                        allRecognitions = recognitions;
                        break;
                    default:
                        allRecognitions = allRecognitions.Concat(recognitions).SelectMany(r => r).ToLookup(r => r.time);
                        break;
                }
            }

            // get recognitions and matching uploads 
            var allRecognitionTimes = allRecognitions.Select(gr => gr.Key).ToList();
            var imagesAndInferencesTimes = allRecognitionTimes.Intersect(allUploads.Keys).ToList();
            return imagesAndInferencesTimes;
        }

        public override void StopListening()
        {
            try
            {
                receivers.ForEach(r => r.Close());

                eventHubClient.Close();
                eventHubClient = null;
                listenerTimer?.Cancel();
            }
            catch (Exception e)
            {

                Debug.WriteLine($"Gap Detection: {e.Message}");
            }
        }


    }
}
