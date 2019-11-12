using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace React.UI.Web.ViewModels
{
    public class ImageEventViewModel
    {
        public ImageEventViewModel()
        {
            Id = string.Empty;
            Name = string.Empty;
            Type = string.Empty;
            Source = string.Empty;
            Body = new BodyViewModel();
            CaptureTime = new DateTimeOffset();
            TimeRecieved = new DateTimeOffset();
            TimeSent = new DateTimeOffset();
            EdgeDeviceName = string.Empty;
        }

        [JsonProperty("id", Order = 1)]
        public string Id { get; set; }
        [JsonProperty("name", Order = 2)]
        public string Name { get; set; }
        [JsonProperty("type", Order = 3)]
        public string Type { get; set; }
        [JsonProperty("source", Order = 4)]
        public string Source { get; set; }
        [JsonProperty("body", Order = 5)]
        public BodyViewModel Body { get; set; }
        [JsonProperty("capturetime", Order = 6)]
        public DateTimeOffset CaptureTime { get; set; }
        [JsonProperty("timeRecieved", Order = 7)]
        public DateTimeOffset TimeRecieved { get; set; }
        [JsonProperty("timeSent", Order = 8)]
        public DateTimeOffset TimeSent { get; set; }
        [JsonProperty("edgeDeviceName", Order = 8)]
        public string EdgeDeviceName { get; set; }
    }
}
