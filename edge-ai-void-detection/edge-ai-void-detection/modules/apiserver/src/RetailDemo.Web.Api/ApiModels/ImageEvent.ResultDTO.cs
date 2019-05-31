using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations.Schema;
using RetailDemo.Core.Entities;

namespace RetailDemo.Web.ApiModels
{
    public class ResultDTO
    {
        //public ResultDTO()
        //{
        //    Num_detections = 0;
        //    Size = new SizeDTO();
        //    Detection_boxes = new List<DetectionBoxesDTO>();
        //    Detection_scores = new List<DetectionScoreDTO>();
        //    Detection_classes = new List<DetectionClassDTO>();
        //}

        [JsonProperty("num_detections", Order = 2)]
        public int Num_detections { get; set; }
        [JsonProperty("size", Order = 3)]
        public SizeDTO Size { get; set; }
        [JsonProperty("detection_boxes", Order = 4)]
        public List<DetectionBoxesDTO> Detection_boxes { get; set; }
        [JsonProperty("detection_scores", Order = 5)]
        public List<DetectionScoreDTO> Detection_scores { get; set; }
        [JsonProperty("detection_classes", Order = 6)]
        public List<DetectionClassDTO> Detection_classes { get; set; }
    }

    public class DetectionBoxesDTO
    {
        //public DetectionBoxesDTO()
        //{
        //    Detection_boxes = new List<DetectionBoxDTO>();
        //}

        [JsonProperty("detection_boxes", Order = 2)]
        public List<DetectionBoxDTO> Detection_boxes { get; set; }
    }

    public class DetectionBoxDTO
    {
        //public DetectionBoxDTO()
        //{
        //    Detection_box = 0;
        //}

        [JsonProperty("detection_box", Order = 2)]
        public double Detection_box { get; set; }
    }

    public class DetectionScoreDTO
    {
        //public DetectionScoreDTO()
        //{
        //    Detection_score = 0;
        //}

        [JsonProperty("detection_score", Order = 2)]
        public double Detection_score { get; set; }
    }

    public class DetectionClassDTO
    {
        //public DetectionClassDTO()
        //{
        //    Detection_class = 0;
        //}

        [JsonProperty("detection_class", Order = 2)]
        public int Detection_class { get; set; }
    }

    public class SizeDTO
    {
        //public SizeDTO()
        //{
        //    Width = string.Empty;
        //    Height = string.Empty;
        //}

        [JsonProperty("width", Order = 2)]
        public string Width { get; set; }
        [JsonProperty("height", Order = 3)]
        public string Height { get; set; }
    }
}
