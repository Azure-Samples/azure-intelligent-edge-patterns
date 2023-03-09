// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Generic;
using System.Drawing;

using BGSObjectDetector;

namespace LineDetector
{
    class SingleLineCrossingDetector : ISingleLineCrossingDetector
    {
        DetectionLine line;
        bool occupancy;
        Box bbox;
        FallingEdgeCrossingDetector lineCrossingDetector;
        bool debug = false;

        public SingleLineCrossingDetector(int a, int b, int c, int d)
        {
            line = new DetectionLine(a, b, c, d);
            lineCrossingDetector = new FallingEdgeCrossingDetector(1);
        }

        public SingleLineCrossingDetector(int a, int b, int c, int d, double threshold, int sFactor)
        {
            line = new DetectionLine(a, b, c, d, threshold);
            lineCrossingDetector = new FallingEdgeCrossingDetector(sFactor);
        }

        public (bool crossingResult, Box b) notifyFrameArrival(int frameNo, List<Box> boxes, Bitmap mask)
        {
            (occupancy, bbox) = line.isOccupied(boxes, mask);
            bool crossingResult = lineCrossingDetector.notifyOccupancy(frameNo, occupancy);
            return (crossingResult, bbox);
        }

        public bool notifyFrameArrival(int frameNo, Bitmap mask)
        {
            occupancy = line.isOccupied(mask);
            bool crossingResult = lineCrossingDetector.notifyOccupancy(frameNo, occupancy);
            return crossingResult;
        }
        public OCCUPANCY_STATE getState()
        {
            return lineCrossingDetector.getState();
        }

        public void setDebug()
        {
            debug = true;
            lineCrossingDetector.setDebug();
        }

        public List<double> getLineOccupancyHistory()
        {
            if (debug)
            {
                return lineCrossingDetector.getLineOccupancyHistory();
            }
            else
            {
                return null;
            }
        }

        public bool getOccupancy()
        {
            return occupancy;
        }

        public DetectionLine getDetectionLine()
        {
            return line;
        }
    }
}
