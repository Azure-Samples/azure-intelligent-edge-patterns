using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public class AbsoluteBoundingRect
{
    public double X;
    public double Y;
    public double W;
    public double H;
}

public delegate void GapDetection(byte[] image, List<AbsoluteBoundingRect> detections);

namespace ServiceListener
{
    class RecognitionMessage
    {
        public string cameraId { get; set; }
        public string time { get; set; }
        public int cls { get; set; }
        public double score { get; set; }

        public double bbymin { get; set; }
        public double bbxmin { get; set; }
        public double bbymax { get; set; }
        public double bbxmax { get; set; }
    }

    class UploadMessage
    {
        public string cameraId { get; set; }
        public string time { get; set; }
        public string type { get; set; }
        public int featureCount { get; set; }
        public string procType { get; set; }
        public double procMsec { get; set; }
    }

    class GapConfig
    {
        public const string SchemaKey = "iothub-message-schema";
        public const string RecognitionSchema = "recognition;v1";
        public const string UploadSchema = "image-upload;v1";
        public const int BlobMaxSize = 1024 * 1024 * 3;
        // Event Hub-compatible endpoint
        // az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
        public const string EventHubsCompatibleEndpoint = "{EVENT_HUB_ENDPOINT}";

        // Event Hub-compatible name
        // az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
        public const string EventHubsCompatiblePath = "{IOT_HUB}";

        // az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
        public const string IotHubSasKey = "{IOT_HUB_KEY}";
        public const string IotHubSasKeyName = "service";

        // container
        public const string ContainerConnectionString = "{STORAGE_CONTAINER_CONNECTION_STRING}";
        public const string ContainerName = "still-images";

    }

    internal class ModelResponse
    {
        public bool IsEmpty
        {
            get { return bboxes.Length == 0; }
        }
        public int[] classes = null;
        public float[] scores = null;
        public float[][] bboxes = null;
        public string img = null;
    }
}
