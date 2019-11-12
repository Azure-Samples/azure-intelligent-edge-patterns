using System;
using RetailDemo.Core.Events;
using RetailDemo.Core.SharedKernel;
using Newtonsoft.Json;

namespace RetailDemo.Core.Entities
{
    public class EdgeDevice : BaseEntity
    {
        public EdgeDevice()
        {
        }

        public int EdgeDeviceId { get; set; }
        [JsonProperty("edgeDeviceName", Order = 2)]
        public string EdgeDeviceName { get; set; }
    }
}
