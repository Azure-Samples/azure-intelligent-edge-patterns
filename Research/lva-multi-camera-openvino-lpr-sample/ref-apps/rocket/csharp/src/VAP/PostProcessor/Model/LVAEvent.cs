// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Runtime.Serialization;

namespace PostProcessor.Model
{
    [DataContract(Name = "LVAEvent")] //LineResult
    public class LVAEvent
    {
        [DataMember(Name = "type")]
        public string type { get; set; } = "event";

        [DataMember(Name = "subtype")]
        public string subtype { get; set; } = "lineCounting";

        [DataMember(Name = "event")]
        public Event evt { get; set; }

        public class Event
        {
            [DataMember(Name = "name")]
            public string name { get; set; }

            [DataMember(Name = "properties")]
            public Properties properties { get; set; }

            public class Properties
            {
                [DataMember(Name = "count")]
                public int count { get; set; }

                [DataMember(Name = "accumulated")]
                public int accumulated { get; set; }
            }

            public Event()
            {
                properties = new Properties();
            }
        }

        public LVAEvent()
        {
            evt = new Event();
        }
    }
}