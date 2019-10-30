using System.Collections.Generic;
using RetailDemo.Core.Events;
using RetailDemo.Core.SharedKernel;
using Newtonsoft.Json;
using System;

namespace RetailDemo.Core.Entities
{
    public class Result : BaseEntity
    {
        public Result()
        {
            Num_detections = 0;
            Size = new Size();
            Detection_boxes = new List<DetectionBoxes>();
            Detection_scores = new List<DetectionScore>();
            Detection_classes = new List<DetectionClass>();
        }

        public int ResultId { get; set; }
        [JsonProperty("num_detections", Order = 2)]
        public int Num_detections { get; set; }
        [JsonProperty("size", Order = 3)]
        public Size Size { get; set; }
        [JsonProperty("detection_boxes", Order = 4)]
        public List<DetectionBoxes> Detection_boxes { get; set; }
        [JsonProperty("detection_scores", Order = 5)]
        public List<DetectionScore> Detection_scores { get; set; }
        [JsonProperty("detection_classes", Order = 6)]
        public List<DetectionClass> Detection_classes { get; set; }

        public int BodyId { get; set; }
        public Body Body { get; set; }
    }

    public class Size : BaseEntity
    {
        public Size()
        {
            Width = string.Empty;
            Height = string.Empty;
        }

        public int SizeId { get; set; }
        [JsonProperty("width", Order = 2)]
        public string Width { get; set; }
        [JsonProperty("height", Order = 3)]
        public string Height { get; set; }

        public int ResultId { get; set; }
        public Result Result { get; set; }
    }

    public class DetectionBoxes : BaseEntity
    {
        public DetectionBoxes()
        {
            Detection_boxes = new List<DetectionBox>();
        }

        public int DetectionBoxesId { get; set; }
        [JsonProperty("detection_boxes", Order = 2)]
        public List<DetectionBox> Detection_boxes { get; set; }

        //public int ResultId { get; set; }
        //public Result Result { get; set; }
    }

    public class DetectionBox : BaseEntity
    {
        public DetectionBox()
        {
            Detection_box = 0;
        }

        public int DetectionBoxId { get; set; }
        [JsonProperty("detection_box", Order = 2)]
        public double Detection_box { get; set; }

        //public int DetectionBoxesId { get; set; }
        //public DetectionBoxes DetectionBoxes { get; set; }
    }

    public class DetectionScore : BaseEntity
    {
        public DetectionScore()
        {
            Detection_score = 0;
        }

        public int DetectionScoreId { get; set; }
        [JsonProperty("detection_score", Order = 2)]
        public double Detection_score { get; set; }

        //public int ResultId { get; set; }
        //public Result Result { get; set; }
    }

    public class DetectionClass : BaseEntity
    {
        public DetectionClass()
        {
            Detection_class = 0;
        }

        public int DetectionClassId { get; set; }
        [JsonProperty("detection_class", Order = 2)]
        public int Detection_class { get; set; }

        //public int ResultId { get; set; }
        //public Result Result { get; set; }
    }
}
