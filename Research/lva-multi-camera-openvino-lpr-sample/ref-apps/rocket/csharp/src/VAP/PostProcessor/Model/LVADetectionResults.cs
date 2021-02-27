// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Runtime.Serialization;

namespace PostProcessor.Model
{
    [DataContract(Name = "LVADetectionResults")]
    [KnownType(typeof(LVAOther))]
    [KnownType(typeof(LVAEntity))]
    public class LVADetectionResults
    {
        [DataMember(Name = "inferences")]
        public object[] dInference { get; set; }
    }
}