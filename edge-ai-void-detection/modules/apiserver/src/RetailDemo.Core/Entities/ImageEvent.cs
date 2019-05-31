using System;
using RetailDemo.Core.Events;
using RetailDemo.Core.SharedKernel;
using Newtonsoft.Json;

namespace RetailDemo.Core.Entities
{
    public class ImageEvent : BaseEntity
    {
        public ImageEvent()
        {
            ImageEventId = 0;
            Name = string.Empty;
            Type = string.Empty;
            Source = string.Empty;
            Body = new Body();
            CaptureTime = DateTimeOffset.Now;
            TimeRecieved = DateTimeOffset.Now;
            EdgeDeviceName = string.Empty;
            RequestId = string.Empty;
        }

        public int ImageEventId { get; set; }
        [JsonProperty("name", Order = 2)]
        public string Name { get; set; }
        [JsonProperty("type", Order = 3)]
        public string Type { get; set; }
        [JsonProperty("source", Order = 4)]
        public string Source { get; set; }
        [JsonProperty("body", Order = 5)]
        public Body Body { get; set; }
        [JsonProperty("capturetime", Order = 6)]
        public DateTimeOffset CaptureTime { get; set; }
        [JsonProperty("timeRecieved", Order = 7)]
        public DateTimeOffset TimeRecieved { get; set; }
        [JsonProperty("edgeDeviceName", Order = 8)]
        public string EdgeDeviceName { get; set; }
        [JsonProperty("requestId", Order = 9)]
        public string RequestId { get; set; }
        [JsonProperty("encodedImage", Order = 10)]
        public byte[] EncodedImage { get; set; }
    }
}
