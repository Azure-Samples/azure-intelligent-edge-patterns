// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace LineDetector.Config
{
    public static class LineDetectorConfig
    {
        public static int UP_STATE_TRANSITION_LENGTH { get; set; } = 4;
        public static int DOWN_STATE_TRANSITION_LENGTH { get; set; } = 10;
    }
}