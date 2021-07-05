// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Runtime.Serialization;

namespace PostProcessor.Model
{
    [DataContract(Name = "LVAOther")]
    public class LVAOther
    {
        [DataMember(Name = "type")]
        public string type { get; set; } = "other";

        [DataMember(Name = "subtype")]
        public string subtype { get; set; } = "statistics";

        [DataMember(Name = "other")]
        public Oth other { get; set; }

        public class Oth
        {
            [DataMember(Name = "inferenceTime")]
            public double inferenceTime { get; set; }

            [DataMember(Name = "count")]
            public int count { get; set; }
        }

        public LVAOther()
        {
            other = new Oth();
        }
    }
}