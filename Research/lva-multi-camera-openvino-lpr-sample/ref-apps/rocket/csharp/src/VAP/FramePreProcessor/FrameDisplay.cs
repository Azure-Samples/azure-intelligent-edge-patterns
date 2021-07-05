// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using OpenCvSharp;

namespace FramePreProcessor
{
    public class FrameDisplay
    {
        public static Mat display(Mat resizedFrame, string videoName)
        {
            Mat frameToDisplay = resizedFrame.Clone();

            Cv2.ImShow(videoName, frameToDisplay);
            Cv2.WaitKey(1);

            return frameToDisplay;
        }
    }
}
