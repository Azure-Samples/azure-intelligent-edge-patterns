using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace React.UI.Web.ViewModels
{
    public class ImageEventListViewModel
    {
        public ImageEventListViewModel()
        {
            LastUpdateTime = new DateTimeOffset();
            ImageEventsViewModels = new Queue<ImageEventViewModel>();
        }
        [JsonProperty("lastUpdateTime", Order = 1)]
        public DateTimeOffset LastUpdateTime { get; set; }
        [JsonProperty("imageEventsViewModels", Order = 2)]
        public Queue<ImageEventViewModel> ImageEventsViewModels { get; set; }
    }
}
