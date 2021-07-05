// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using BGSObjectDetector;
using DNNDetector;
using DNNDetector.Config;
using DNNDetector.Model;
using LineDetector;
using LineDetector.Config;
using OpenCvSharp;
using PostProcessor;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using Utils.Config;
using Wrapper.ORT;

namespace VideoPipelineCore
{
    public class VAPCore
    {
        static string videoUrl;
        static string lineFile;
        static Dictionary<string, int> category = new Dictionary<string, int>();
        static int SAMPLING_FACTOR = 1;
        static double RESOLUTION_FACTOR = 1;

        static int pplConfig = Convert.ToInt16(ConfigurationManager.AppSettings["PplConfig"]);
        static bool loop = false;
        static bool displayRawVideo = false;
        static bool displayBGSVideo = false;

        static Decoder.Decoder decoder;
        static BGSObjectDetector.BGSObjectDetector bgs;
        static List<Box> foregroundBoxes;
        static Dictionary<string, int> counts;
        static Dictionary<string, bool> occupancy;
        static Detector lineDetector;
        static List<Tuple<string, int[]>> lines;
        static LineTriggeredDNNORTYolo ltDNN;
        static List<Item> ltDNNItemList;
        static CascadedDNNORTYolo ccDNN;
        static List<Item> ccDNNItemList;
        static FrameDNNOnnxYolo frameDNNOnnxYolo;
        static List<Item> frameDNNOnnxItemList;
        static List<Item> itemList;

        static int frameIndex = 0;

        static DateTime startTime, prevTime;
        static Dictionary<string, int> prevCounts;

        static Queue<Mat> frameBuffer;
        public static bool isDNNRunning { get; set; }
        static double avgFps1 = double.PositiveInfinity;

        static long teleCountsBGS = 0, teleCountsCheapDNN = 0, teleCountsHeavyDNN = 0;

        public static void Initialize(string[] args)
        {
            //Console.WriteLine("Usage: <exe> <video url> <pipeline> <cfg file> <samplingFactor> <resolutionFactor> <buffersize> <uptran> <downtran> <category1> <category2> ...");
            
            videoUrl = args[0];
            switch (ConfigurationManager.AppSettings["Runtime"])
            {
                case "docker":
                    videoUrl = @"./media/" + args[0];
                    break;
                case "vs":
                    videoUrl = @"..\..\..\media\" + args[0];
                    break;
            }
            if (args[1] != null)
            {
                pplConfig = int.Parse(args[1]);
            }
            if (args[2] != null)
            {
                switch (ConfigurationManager.AppSettings["Runtime"])
                {
                    case "docker":
                        if (args[2].Substring(0, 4) != "http")
                        {
                            lineFile = $@"./cfg/{args[2]}";
                        }
                        else
                        {
                            using (var client = new WebClient())
                            {
                                client.DownloadFile(args[2], @"./cfg/line.txt");
                            }
                            lineFile = @"./cfg/line.txt";
                        }
                        break;
                    case "vs":
                        if (args[2].Substring(0, 4) != "http")
                        {
                            lineFile = $@"..\..\..\cfg\{args[2]}";
                        }
                        else
                        {
                            using (var client = new WebClient())
                            {
                                client.DownloadFile(args[2], @"..\..\..\cfg\line.txt");
                            }
                            lineFile = @"..\..\..\cfg\line.txt";
                        }
                        break;
                }
            }
            if (args[3] != null) SAMPLING_FACTOR = int.Parse(args[3]);
            if (args[4] != null) RESOLUTION_FACTOR = double.Parse(args[4]);
            if (args[5] != null) DNNConfig.FRAME_SEARCH_RANGE = int.Parse(args[5]);
            if (args[6] != null) LineDetectorConfig.UP_STATE_TRANSITION_LENGTH = int.Parse(args[6]);
            if (args[7] != null) LineDetectorConfig.DOWN_STATE_TRANSITION_LENGTH = int.Parse(args[7]);

            //if no categpry is specified, add all classes from coco dataset
            if (args.Length > 8)
            {
                for (int i = 8; i < args.Length; i++)
                {
                    category.Add(args[i], 0);
                }
            }
            else
            {
                string[] cocoNames = null;
                switch (ConfigurationManager.AppSettings["Runtime"])
                {
                    case "docker":
                        cocoNames = File.ReadAllLines(@"./modelOnnx/coco.names");
                        break;
                    case "vs":
                        cocoNames = File.ReadAllLines(@"..\..\..\modelOnnx\coco.names");
                        break;
                }
                foreach (string name in cocoNames)
                {
                    category.Add(name, 0);
                }
            }

            //initialize outputfolder
            switch (ConfigurationManager.AppSettings["Runtime"])
            {
                case "docker":
                    OutputFolder.OutputFolderRoot = "output/";
                    break;
            }
            OutputFolder.OutputFolderInit();

            //----------
            //initialize pipeline components
            Utils.Utils.cleanFolder(@OutputFolder.OutputFolderAll);
            //decoder = new Decoder.Decoder(videoUrl, loop); //decoder is not used in integration with LVA
            //----------
            if (new int[] { 5, 1, 2, 3, 4 }.Contains(pplConfig))
            {
                bgs = new BGSObjectDetector.BGSObjectDetector();
                foregroundBoxes = null;
                lineDetector = new Detector(SAMPLING_FACTOR, RESOLUTION_FACTOR, lineFile, displayBGSVideo);
                counts = null;
                occupancy = null;
                lines = lineDetector.multiLaneDetector.getAllLines();
                LVAPostProcessor.InitializeCountingResult(lines);
            }
            //----------
            //LineTriggeredDNNTF ltDNN = new LineTriggeredDNNTF(lines);
            //List<Item> ltDNNItemList = new List<Item>();
            //----------
            if (new int[] { 2 }.Contains(pplConfig))
            {
                ltDNN = new LineTriggeredDNNORTYolo(lines, "yolov3");
                ltDNNItemList = new List<Item>();
            }
            //----------
            if (new int[] { 1 }.Contains(pplConfig))
            {
                ltDNN = new LineTriggeredDNNORTYolo(lines, "yolov3tiny");
                ltDNNItemList = new List<Item>();
            }
            //----------
            if (new int[] { 1 }.Contains(pplConfig))
            {
                ccDNN = new CascadedDNNORTYolo(lines, "yolov3");
                ccDNNItemList = new List<Item>();
            }
            //----------
            //FrameDNNTF frameDNNTF = new FrameDNNTF(lines);
            //List<Item> frameDNNTFItemList = new List<Item>();
            //Utils.Utils.cleanFolder(@OutputFolder.OutputFolderFrameDNNTF);
            //----------
            if (new int[] { 3, 6 }.Contains(pplConfig))
            {
                frameDNNOnnxYolo = new FrameDNNOnnxYolo(lines, "yolov3", DNNMode.Frame);
                frameDNNOnnxItemList = new List<Item>();
                Utils.Utils.cleanFolder(@OutputFolder.OutputFolderFrameDNNONNX);
            }
            //----------
            if (new int[] { 4, 7 }.Contains(pplConfig))
            {
                frameDNNOnnxYolo = new FrameDNNOnnxYolo(lines, "yolov3tiny", DNNMode.Frame);
                frameDNNOnnxItemList = new List<Item>();
                Utils.Utils.cleanFolder(@OutputFolder.OutputFolderFrameDNNONNX);
            }

            itemList = null;

            //RUN PIPELINE 
            startTime = DateTime.Now;
            prevTime = DateTime.Now;
            prevCounts = new Dictionary<string, int>();

            frameBuffer = new Queue<Mat>(DNNConfig.RAW_FRAME_BUFFER_SIZE);
        }

        public static void BufferFrame(byte[] frameByte)
        {
            Mat frame = Mat.FromImageData(frameByte, ImreadModes.Color);
            frameBuffer.Enqueue(frame);
            if (frameBuffer.Count > DNNConfig.RAW_FRAME_BUFFER_SIZE)
                frameBuffer.Dequeue();
        }

        public static string RunOneFrame()
        {
            isDNNRunning = true;
            prevTime = DateTime.Now;

            Mat frame = null;
            try
            {
                frame = frameBuffer.Dequeue();
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                isDNNRunning = false;
                return null;
            }

            //frame pre-processor
            frame = FramePreProcessor.PreProcessor.returnFrame(frame, frameIndex, SAMPLING_FACTOR, RESOLUTION_FACTOR, displayRawVideo, "defaultVideo");
            frameIndex++;
            if (frame == null)
            {
                isDNNRunning = false;
                return null;
            }
            //Console.WriteLine("Frame ID: " + frameIndex);


            //background subtractor
            Mat fgmask = null;
            if (new int[] { 5, 2, 1 }.Contains(pplConfig))
            {
                foregroundBoxes = bgs.DetectObjects(DateTime.Now, frame, frameIndex, out fgmask);
            }


            //line counter
            if (new int[] { 5, 2, 1 }.Contains(pplConfig))
            {
                (counts, occupancy) = lineDetector.updateLineResults(frame, frameIndex, fgmask, foregroundBoxes, ref teleCountsBGS, true);
            }


            //cheap DNN
            if (new int[] { 2, 1 }.Contains(pplConfig))
            {
                ltDNNItemList = ltDNN.Run(frame, frameIndex, counts, lines, category, ref teleCountsCheapDNN, true);
                if (ltDNNItemList != null)
                    foreach (Item ltDNNItem in ltDNNItemList)
                        ltDNNItem.Print();
                itemList = ltDNNItemList;
            }


            //heavy DNN
            if (new int[] { 1 }.Contains(pplConfig))
            {
                ccDNNItemList = ccDNN.Run(frameIndex, ltDNNItemList, lines, category, ref teleCountsHeavyDNN, true);
                if (ccDNNItemList != null)
                    foreach (Item ccDNNItem in ccDNNItemList)
                        ccDNNItem.Print();
                itemList = ccDNNItemList;
            }


            //frame DNN TF
            //frameDNNTFItemList = frameDNNTF.Run(frame, frameIndex, category, System.Drawing.Brushes.Pink, 0.2);
            //if (frameDNNTFItemList.Count != 0)
            //{
            //    Console.WriteLine("TF detected!");
            //}


            //frame DNN ORTONNXYolo
            if (new int[] { 3, 4 }.Contains(pplConfig))
            {
                frameDNNOnnxItemList = frameDNNOnnxYolo.Run(frame, frameIndex, category, Brushes.Pink, 0, DNNConfig.MIN_SCORE_FOR_LINEBBOX_OVERLAP_LARGE, true);
                itemList = frameDNNOnnxItemList;
            }


            //frame DNN ORTONNXYolo for object detection
            if (new int[] { 6, 7 }.Contains(pplConfig))
            {
                frameDNNOnnxItemList = frameDNNOnnxYolo.Run(frame, frameIndex, category, Brushes.Pink, 0, DNNConfig.MIN_SCORE_FOR_LINEBBOX_OVERLAP_SMALL, true);
                itemList = frameDNNOnnxItemList;
            }


            //store images in Azure blob
            //DataPersistence.PersistResult(frameIndex, ccDNNItemList, "test");


            double processTime = (DateTime.Now - prevTime).TotalMilliseconds;
            string resultStringDetection = "";
            string resultStringCounting = "";
            if (new int[] { 6, 7 }.Contains(pplConfig))
            {
                resultStringDetection = LVAPostProcessor.SerializeDetectionResult(itemList, processTime, frame.Width, frame.Height);
                Console.WriteLine(resultStringDetection);
            }
            else if (new int[] { 5 }.Contains(pplConfig))
            {
                resultStringCounting = LVAPostProcessor.SerializeCountingResultFromCounts(counts, processTime);
                Console.WriteLine(resultStringCounting);
            }
            else if (new int[] { 1, 2, 3, 4 }.Contains(pplConfig))
            {
                resultStringCounting = LVAPostProcessor.SerializeCountingResultFromItemList(itemList, processTime);
                Console.WriteLine(resultStringCounting);
            }            


            //print out stats
            double fps = 1000 / processTime;
            avgFps1 = 1000 / (((1000 / avgFps1) * (frameIndex - 1) + processTime) / (long)frameIndex);
            double avgFps2 = 1000 * (long)frameIndex / (DateTime.Now - startTime).TotalMilliseconds;
            Console.WriteLine("{0} {1,-5} {2} {3,-5} {4} {5,-15} {6} {7,-10:N2} {8} {9,-10:N2} {10} {11,-10:N2}",
                                "sFactor:", SAMPLING_FACTOR, "rFactor:", RESOLUTION_FACTOR, "FrameID:", frameIndex, "ProcessTime:", processTime, "Avg. Processing FPS:", avgFps1 * SAMPLING_FACTOR, "Avg. E2E FPS:", avgFps2);
            Console.WriteLine("{0} {1,-5} {2} {3,-5} {4} {5,-15}",
                                "BGS counts:", teleCountsBGS, "Cheap DNN counts:", teleCountsCheapDNN, "Heavy DNN counts:", teleCountsHeavyDNN);
            Console.WriteLine();


            isDNNRunning = false;
            if (new int[] { 6, 7 }.Contains(pplConfig))
            {
                return resultStringDetection;
            }
            else
            {
                return resultStringCounting;
            }
        }

        public static bool GetDNNRunningState()
        {
            return isDNNRunning;
        }

        public static int GetFrameBufferSize()
        {
            return frameBuffer.Count;
        }
    }
}
