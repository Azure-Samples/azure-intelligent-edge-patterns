using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace React.UI.Web.ViewModels
{
    public class BodyViewModel
    {
        public BodyViewModel()
        {
            ModuleId = string.Empty;
            MessageId = string.Empty;
            Src_img = string.Empty;
            Dest_img = string.Empty;
            Result = new ResultViewModel();
        }

        [JsonProperty("moduleId", Order = 1)]
        public string ModuleId { get; set; }
        [JsonProperty("messageId", Order = 2)]
        public string MessageId { get; set; }
        [JsonProperty("src_img", Order = 3)]
        public string Src_img { get; set; }
        [JsonProperty("dest_img", Order = 4)]
        public string Dest_img { get; set; }
        [JsonProperty("result", Order = 5)]
        public ResultViewModel Result { get; set; }
    }
}
