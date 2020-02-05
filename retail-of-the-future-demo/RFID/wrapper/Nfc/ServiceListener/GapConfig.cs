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
        public const string EventHubsCompatibleEndpoint = "sb://iothub-ns-iothub-235-2293953-f7991010b9.servicebus.windows.net/";

        // Event Hub-compatible name
        // az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
        public const string EventHubsCompatiblePath = "iothub-235un";

        // az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
        public const string IotHubSasKey = "kmv88qp/A1lZZrDpcnmzMtj3lZHoLLs37JoN5hHUHVQ=";
        public const string IotHubSasKeyName = "service";

        // container
        public const string ContainerConnectionString = "DefaultEndpointsProtocol=https;AccountName=storage235un;AccountKey=KLrA9L5pBFK1ETUVZzLuX7Lc0CQRJ8uMpuaQ1o0h+dw7ZRk7mZaiOyXZN/bXtCLZ6+a8FWhwzJhnhLC9gM8qGw==;EndpointSuffix=core.windows.net";
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
