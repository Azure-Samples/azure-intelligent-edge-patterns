using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using RetailDemo.Core.Entities;

namespace RetailDemo.Web.ApiModels
{
    public class BodyDTO
    {
        public BodyDTO()
        {
            ModuleId = string.Empty;
            MessageId = string.Empty;
            Src_img = string.Empty;
            Dest_img = string.Empty;
            Result = new ResultDTO();
        }

        [JsonProperty("id", Order = 1)]
        public int Id { get; set; }
        [JsonProperty("moduleId", Order = 2)]
        public string ModuleId { get; set; }
        [JsonProperty("messageId", Order = 3)]
        public string MessageId { get; set; }
        [JsonProperty("src_img", Order = 4)]
        public string Src_img { get; set; }
        [JsonProperty("dest_img", Order = 5)]
        public string Dest_img { get; set; }
        [JsonProperty("result", Order = 6)]
        public ResultDTO Result { get; set; }
    }
}

