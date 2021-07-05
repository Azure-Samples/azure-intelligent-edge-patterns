// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Runtime.Serialization;
using System;
using System.Collections.Generic;

namespace PostProcessor.Model
{
    [DataContract(Name = "LVACountingResults")]
    [KnownType(typeof(LVAOther))]
    [KnownType(typeof(LVAEvent))]
    public class LVACountingResults
    {
        [DataMember(Name = "inferences")]
        public object[] cInference { get; set; }

        public LVACountingResults(List<Tuple<string, int[]>> lines)
        {
            cInference = new object[lines.Count + 1];
            LVAOther other = new LVAOther();
            other.other.count = lines.Count;
            cInference[0] = other;
            
            for (int i = 0; i < lines.Count; i++)
            {
                LVAEvent lineResult = new LVAEvent();
                lineResult.evt.name = lines[i].Item1;
                lineResult.evt.properties.count = 0;
                lineResult.evt.properties.accumulated = 0;
                cInference[i + 1] = lineResult;
            }    
        }
    }
}