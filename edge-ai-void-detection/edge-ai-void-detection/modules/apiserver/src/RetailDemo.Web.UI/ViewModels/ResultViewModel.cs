using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace React.UI.Web.ViewModels
{
    public class ResultViewModel
    {
        public ResultViewModel()
        {
            Num_detections = 0;
            Size = new SizeViewModel();
            Detection_boxes = new List<IList<double>>();
            Detection_scores = new List<double>();
            Detection_classes = new List<int>();
        }

        [JsonProperty("num_detections", Order = 1)]
        public int Num_detections { get; set; }
        [JsonProperty("size", Order = 2)]
        public SizeViewModel Size { get; set; }
        [JsonProperty("detection_boxes", Order = 3)]
        public IList<IList<double>> Detection_boxes { get; set; }
        [JsonProperty("detection_scores", Order = 4)]
        public IList<double> Detection_scores { get; set; }
        [JsonProperty("detection_classes", Order = 5)]
        public IList<int> Detection_classes { get; set; }
    }

    public class SizeViewModel
    {
        public SizeViewModel()
        {
            Width = string.Empty;
            Height = string.Empty;
        }
        [JsonProperty("width", Order = 1)]
        public string Width { get; set; }
        [JsonProperty("height", Order = 2)]
        public string Height { get; set; }
    }
}
