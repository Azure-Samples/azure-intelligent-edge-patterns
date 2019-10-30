using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using RetailDemo.Core.Entities;

namespace RetailDemo.Web.ApiModels
{
    public class ImageEventDTO
    {
        public ImageEventDTO()
        {
            Name = string.Empty;
            Type = string.Empty;
            Source = string.Empty;
            CaptureTime = DateTimeOffset.Now;
            TimeRecieved = DateTimeOffset.Now;
            TimeSent = DateTimeOffset.Now;
            EdgeDeviceName = string.Empty;
            Body = new BodyDTO();
        }

        [JsonProperty("id", Order = 1)]
        public int Id { get; set; }
        [JsonProperty("name", Order = 2)]
        public string Name { get; set; }
        [JsonProperty("type", Order = 3)]
        public string Type { get; set; }
        [JsonProperty("source", Order = 4)]
        public string Source { get; set; }
        [JsonProperty("body", Order = 5)]
        public BodyDTO Body { get; set; }
        [JsonProperty("capturetime", Order = 6)]
        public DateTimeOffset CaptureTime { get; set; }
        [JsonProperty("timeRecieved", Order = 7)]
        public DateTimeOffset TimeRecieved { get; set; }
        [JsonProperty("timeSent", Order = 8)]
        public DateTimeOffset TimeSent { get; set; }
        [JsonProperty("edgeDeviceName", Order = 8)]
        public string EdgeDeviceName { get; set; }
        [JsonProperty("encodedImage", Order = 9)]
        public byte[] EncodedImage { get; set; }

        public static ImageEventDTO FromImageEvent(ImageEvent item)
        {
            ImageEventDTO imageEventDTO = new ImageEventDTO
            {
                Id = item.Id,
                Name = item.Name,
                EdgeDeviceName = item.EdgeDeviceName,
                CaptureTime = item.CaptureTime,
                Source = item.Source,
                TimeRecieved = DateTimeOffset.Now,
                TimeSent = DateTimeOffset.MinValue,
                Type = item.Type,
                Body = new BodyDTO
                {
                    Dest_img = item.Body.Dest_img,
                    MessageId = item.Body.MessageId,
                    ModuleId = item.Body.ModuleId,
                    Src_img = item.Body.Src_img,
                    Result = new ResultDTO
                    {
                        Detection_boxes = new List<DetectionBoxesDTO>(),
                        Detection_classes = new List<DetectionClassDTO>(),
                        Detection_scores = new List<DetectionScoreDTO>(),
                        Size = new SizeDTO(),
                        Num_detections = item.Body.Result.Num_detections
                    }
                }
            };

            foreach(var i in item.Body.Result.Detection_boxes)
            {
                var detectionBoxes = new DetectionBoxesDTO();
                foreach (var b in i.Detection_boxes)
                {
                    detectionBoxes.Detection_boxes.Add(new DetectionBoxDTO
                    {
                        Detection_box = b.Detection_box
                    });
                }

                imageEventDTO.Body.Result.Detection_boxes.Add(detectionBoxes);
            }

            foreach(var i in item.Body.Result.Detection_classes)
            {
                imageEventDTO.Body.Result.Detection_classes.Add(new DetectionClassDTO
                {
                    Detection_class = i.Detection_class
                });
            }

            foreach (var i in item.Body.Result.Detection_scores)
            {
                imageEventDTO.Body.Result.Detection_scores.Add(new DetectionScoreDTO
                {
                    Detection_score = i.Detection_score
                });
            }

            return imageEventDTO;
        }

        public static ImageEvent ToImageEvent(ImageEventDTO item)
        {
            var imageEvent = new ImageEvent
            {
                CaptureTime = item.CaptureTime,
                EdgeDeviceName = item.EdgeDeviceName,
                Source = item.Source,
                TimeRecieved = DateTimeOffset.Now,
                Type = item.Type,
                Name = item.Name,
                Body = new Body
                {
                    Dest_img = item.Body.Dest_img,
                    MessageId = item.Body.MessageId,
                    ModuleId = item.Body.ModuleId,
                    Src_img = item.Body.Src_img,
                    Result = new Result
                    {
                        Num_detections = item.Body.Result.Num_detections,
                        Detection_boxes = new List<DetectionBoxes>(),
                        Detection_classes = new List<DetectionClass>(),
                        Detection_scores = new List<DetectionScore>(),
                        Size = new Size
                        {
                            Height = item.Body.Result.Size.Height,
                            Width = item.Body.Result.Size.Width
                        }
                    }
                }
            };

            foreach (var i in item.Body.Result.Detection_boxes)
            {
                var detectionBoxesItem = new DetectionBoxes();
                foreach (var b in i.Detection_boxes)
                {
                    detectionBoxesItem.Detection_boxes.Add(new DetectionBox
                    {
                        Detection_box = b.Detection_box
                    });
                }
                imageEvent.Body.Result.Detection_boxes.Add(detectionBoxesItem);
            }

            foreach (var i in item.Body.Result.Detection_classes)
            {
                imageEvent.Body.Result.Detection_classes.Add(new DetectionClass
                {
                    Detection_class = i.Detection_class
                });
            }

            foreach (var i in item.Body.Result.Detection_scores)
            {
                imageEvent.Body.Result.Detection_scores.Add(new DetectionScore
                {
                    Detection_score = i.Detection_score
                });
            }

            return imageEvent;
        }
    }
}
