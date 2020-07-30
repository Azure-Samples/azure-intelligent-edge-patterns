// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using DNNDetector.Model;
using PostProcessor.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;

namespace PostProcessor
{
    public class LVAPostProcessor
    {
        static LVACountingResults countingConsolidation;

        public static string SerializeDetectionResult(List<Item> detectionItems, double processTime, int w, int h)
        {
            if (detectionItems != null && detectionItems.Count != 0)
            {
                foreach (Item item in detectionItems)
                {
                    Console.WriteLine($"{item.ObjName}\t{item.ObjId}\t{item.Confidence}\t{item.X}");
                }

                LVADetectionResults detectionConsolidation = new LVADetectionResults();
                detectionConsolidation.dInference = new object[detectionItems.Count + 1];
                
                //Compose other
                LVAOther other = new LVAOther();
                other.other.inferenceTime = processTime;
                other.other.count = detectionItems.Count;
                detectionConsolidation.dInference[0] = other;

                //Compose entity
                for (int i = 0; i < detectionItems.Count; i++)
                {
                    LVAEntity obj = new LVAEntity();
                    obj.entity.tag.value = detectionItems[i].ObjName;
                    obj.entity.tag.confidence = detectionItems[i].Confidence;
                    obj.entity.box.t = (double)detectionItems[i].Y / h;
                    obj.entity.box.l = (double)detectionItems[i].X / w;
                    obj.entity.box.w = (double)detectionItems[i].Width / w;
                    obj.entity.box.h = (double)detectionItems[i].Height / h;
                    detectionConsolidation.dInference[i + 1] = obj;
                }

                //Create a stream to serialize the object to.  
                MemoryStream ms = new MemoryStream();

                //Serializer the User object to the stream.
                var settings = new DataContractJsonSerializerSettings();
                settings.EmitTypeInformation = EmitTypeInformation.Never;
                DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(LVADetectionResults), settings);
                ser.WriteObject(ms, detectionConsolidation);
                byte[] json = ms.ToArray();
                ms.Close();
                return Encoding.UTF8.GetString(json, 0, json.Length);
            }

            return null;
        }


        public static void InitializeCountingResult(List<Tuple<string, int[]>> lines)
        {
            countingConsolidation = new LVACountingResults(lines);
        }

        public static string SerializeCountingResultFromItemList(List<Item> detectionItems, double processTime)
        {
            LVAOther other = (LVAOther)countingConsolidation.cInference[0];
            other.other.inferenceTime = processTime;
            for (int i = 1; i < (countingConsolidation.cInference.Length); i++)
            {
                LVAEvent lResult = (LVAEvent)countingConsolidation.cInference[i];
                if (detectionItems != null && detectionItems.Count != 0)
                {
                    int previousAccuCounts = lResult.evt.properties.accumulated;
                    foreach (Item item in detectionItems)
                    {
                        if (lResult.evt.name == item.TriggerLine)
                        {
                            lResult.evt.properties.accumulated++;
                        }
                    }
                    lResult.evt.properties.count = lResult.evt.properties.accumulated - previousAccuCounts;
                }
                else
                {
                    lResult.evt.properties.count = 0;
                }
            }

            //Create a stream to serialize the object to.  
            MemoryStream ms = new MemoryStream();

            //Serializer the User object to the stream.
            var settings = new DataContractJsonSerializerSettings();
            settings.EmitTypeInformation = EmitTypeInformation.Never;
            DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(LVACountingResults), settings);
            ser.WriteObject(ms, countingConsolidation);
            byte[] json = ms.ToArray();
            ms.Close();
            return Encoding.UTF8.GetString(json, 0, json.Length);
        }

        public static string SerializeCountingResultFromCounts(Dictionary<string, int> counts, double processTime)
        {
            LVAOther other = (LVAOther)countingConsolidation.cInference[0];
            other.other.inferenceTime = processTime;
            for (int i = 1; i < (countingConsolidation.cInference.Length); i++)
            {
                LVAEvent lResult = (LVAEvent)countingConsolidation.cInference[i];
                lResult.evt.properties.count = counts[lResult.evt.name] - lResult.evt.properties.accumulated;
                lResult.evt.properties.accumulated = counts[lResult.evt.name];
            }

            //Create a stream to serialize the object to.  
            MemoryStream ms = new MemoryStream();

            //Serializer the User object to the stream.
            var settings = new DataContractJsonSerializerSettings();
            settings.EmitTypeInformation = EmitTypeInformation.Never;
            DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(LVACountingResults), settings);
            ser.WriteObject(ms, countingConsolidation);
            byte[] json = ms.ToArray();
            ms.Close();
            return Encoding.UTF8.GetString(json, 0, json.Length);
        }
    }
}
