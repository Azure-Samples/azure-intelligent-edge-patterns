// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System;

using OpenCvSharp;

namespace FramePreProcessor
{
    public class PreProcessor
    {
        public static Mat returnFrame(Mat sourceMat, int frameIndex, int SAMPLING_FACTOR, double RESOLUTION_FACTOR, bool display, string videoName)
        {
            Mat resizedFrame = null, frameDisplay = null;

            if (frameIndex % SAMPLING_FACTOR != 0) return resizedFrame;

            //export raw frames
            //string fileName = frameIndex.ToString("0000.##");
            //sourceMat.SaveImage($@"frame{fileName}.jpg");

            try
            {
                resizedFrame = sourceMat.Resize(new Size((int)(sourceMat.Size().Width * RESOLUTION_FACTOR), (int)(sourceMat.Size().Height * RESOLUTION_FACTOR)));
                if (display)
                {
                    frameDisplay = FrameDisplay.display(resizedFrame, videoName);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                Console.WriteLine("*****RESET RESIZE*****");
                return null;
            }
            return resizedFrame;
        }
    }
}
