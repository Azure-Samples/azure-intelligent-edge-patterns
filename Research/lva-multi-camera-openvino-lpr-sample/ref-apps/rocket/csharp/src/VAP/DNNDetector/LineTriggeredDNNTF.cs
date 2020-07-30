// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using DNNDetector.Config;
using DNNDetector.Model;
using OpenCvSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Utils.Config;

namespace DNNDetector
{
    //Todo: merge it with LineTriggeredDNNYolo
    public class LineTriggeredDNNTF
    {
        Dictionary<string, int> counts_prev = new Dictionary<string, int>();

        FrameDNNTF frameDNNTF;
        FrameBuffer frameBufferLtDNNTF;

        public LineTriggeredDNNTF(List<Tuple<string, int[]>> lines)
        {
            frameBufferLtDNNTF = new FrameBuffer(DNNConfig.FRAME_SEARCH_RANGE);

            frameDNNTF = new FrameDNNTF(lines);

            Utils.Utils.cleanFolder(@OutputFolder.OutputFolderBGSLine);
            Utils.Utils.cleanFolder(@OutputFolder.OutputFolderLtDNN);
        }

        public List<Item> Run(Mat frame, int frameIndex, Dictionary<string, int> counts, List<Tuple<string, int[]>> lines, Dictionary<string, int> category)
        {
            // buffer frame
            frameBufferLtDNNTF.Buffer(frame);

            if (counts_prev.Count != 0)
            {
                foreach (string lane in counts.Keys)
                {
                    int diff = Math.Abs(counts[lane] - counts_prev[lane]);
                    if (diff > 0) //object detected by BGS
                    {
                        if (frameIndex >= DNNConfig.FRAME_SEARCH_RANGE)
                        {
                            string blobName_BGS = $@"frame-{frameIndex}-BGS-{lane}-{counts[lane]}.jpg";
                            string fileName_BGS = @OutputFolder.OutputFolderBGSLine + blobName_BGS;
                            frame.SaveImage(fileName_BGS);
                            frame.SaveImage(@OutputFolder.OutputFolderAll + blobName_BGS);

                            // call tf cheap model for crosscheck
                            int lineID = Array.IndexOf(counts.Keys.ToArray(), lane);
                            int subLineID = lines[lineID].Item2.Length;
                            Mat[] frameBufferArray = frameBufferLtDNNTF.ToArray();
                            int frameIndexTF = frameIndex - 1;
                            DateTime start = DateTime.Now;
                            List<Item> analyzedTrackingItems = null;

                            while (frameIndex - frameIndexTF < DNNConfig.FRAME_SEARCH_RANGE)
                            {
                                Console.WriteLine("** Calling Cheap on " + (DNNConfig.FRAME_SEARCH_RANGE - (frameIndex - frameIndexTF)));
                                Mat frameTF = frameBufferArray[DNNConfig.FRAME_SEARCH_RANGE - (frameIndex - frameIndexTF)];

                                analyzedTrackingItems = frameDNNTF.Run(frameTF, (DNNConfig.FRAME_SEARCH_RANGE - (frameIndex - frameIndexTF)), category, System.Drawing.Brushes.Pink, DNNConfig.MIN_SCORE_FOR_LINEBBOX_OVERLAP_LARGE);

                                // object detected by cheap model
                                if (analyzedTrackingItems != null)
                                {
                                    List<Item> ltDNNItem = new List<Item>();
                                    foreach (Item item in analyzedTrackingItems)
                                    {
                                        item.RawImageData = Utils.Utils.ImageToByteBmp(OpenCvSharp.Extensions.BitmapConverter.ToBitmap(frameTF));
                                        item.TriggerLine = lane;
                                        item.TriggerLineID = lineID;
                                        item.Model = "Cheap";
                                        ltDNNItem.Add(item);

                                        // output cheap TF results
                                        string blobName_Cheap = $@"frame-{frameIndex}-Cheap-{item.Confidence}.jpg";
                                        string fileName_Cheap = @OutputFolder.OutputFolderLtDNN + blobName_Cheap;
                                        File.WriteAllBytes(fileName_Cheap, item.TaggedImageData);
                                        File.WriteAllBytes(@OutputFolder.OutputFolderAll + blobName_Cheap, item.TaggedImageData);
                                    }
                                    updateCount(counts);
                                    return ltDNNItem;
                                }
                                frameIndexTF--;
                            }
                        }
                    }
                }
            }
            updateCount(counts);

            return null;
        }

        void updateCount(Dictionary<string, int> counts)
        {
            foreach (string dir in counts.Keys)
            {
                counts_prev[dir] = counts[dir];
            }
        }
    }
}
