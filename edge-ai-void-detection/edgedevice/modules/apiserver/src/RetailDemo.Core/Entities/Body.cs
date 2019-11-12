using System;
using RetailDemo.Core.Events;
using RetailDemo.Core.SharedKernel;
using Newtonsoft.Json;

namespace RetailDemo.Core.Entities
{
    public class Body : BaseEntity
    {
        public Body()
        {
            BodyId = 0;
            ModuleId = string.Empty;
            MessageId = string.Empty;
            Src_img = string.Empty;
            Dest_img = string.Empty;
            Result = new Result();
        }

        public int BodyId { get; set; }
        [JsonProperty("moduleId", Order = 2)]
        public string ModuleId { get; set; }
        [JsonProperty("messageId", Order = 3)]
        public string MessageId { get; set; }
        [JsonProperty("src_img", Order = 4)]
        public string Src_img { get; set; }
        [JsonProperty("dest_img", Order = 5)]
        public string Dest_img { get; set; }
        [JsonProperty("result", Order = 6)]
        public Result Result { get; set; }

        public int ImageEventId { get; set; }
        public ImageEvent ImageEvent { get; set; }
    }
}
