// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System;
using System.Collections.Generic;
using System.Drawing;

using BGSObjectDetector;

namespace LineDetector
{
    public interface ILineBasedDetector
    {
        void notifyFrameArrival(int frameNo, List<Box> boxes, Bitmap mask);
        void notifyFrameArrival(int frameNo, Bitmap mask);
        int getCount();
        Box getBbox();
        void setDebug();

        bool getOccupancy();

        void setCount(int value);

        List<List<double>> getOccupancyHistory();

        Dictionary<string, Object> getParameters();
        int[] getLineCoor();
    }
}
