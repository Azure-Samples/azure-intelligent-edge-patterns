using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using RetailDemo.Core.Entities;

namespace RetailDemo.Web.ApiModels
{
    public class EdgeDeviceDTO
    {
        public EdgeDeviceDTO()
        {
        }

        [JsonProperty("id", Order = 1)]
        public int Id { get; set; }
        [JsonProperty("edgeDeviceName", Order = 2)]
        public string EdgeDeviceName { get; set; }

        public static EdgeDeviceDTO FromEdgeDevice(EdgeDevice item)
        {
            EdgeDeviceDTO edgeDeviceDTO = new EdgeDeviceDTO
            {
                Id = item.Id,
                EdgeDeviceName = item.EdgeDeviceName
            };

            return edgeDeviceDTO;
        }
    }
}
