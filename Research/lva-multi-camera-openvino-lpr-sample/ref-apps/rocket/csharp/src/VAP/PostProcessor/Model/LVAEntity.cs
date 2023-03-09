// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Runtime.Serialization;

namespace PostProcessor.Model
{
    [DataContract(Name = "LVAEntity")]
    public class LVAEntity
    {
        [DataMember(Name = "type")]
        public string type { get; set; } = "entity";

        [DataMember(Name = "entity")]
        public Entity entity { get; set; }

        public class Entity
        {
            [DataMember(Name = "tag")]
            public Tag tag { get; set; }

            public class Tag
            {
                [DataMember(Name = "value")]
                public string value { get; set; }

                [DataMember(Name = "confidence")]
                public double confidence { get; set; }
            }

            [DataMember(Name = "box")]
            public Box box { get; set; }

            public class Box
            {
                [DataMember(Name = "left")]
                public double l { get; set; }

                [DataMember(Name = "top")]
                public double t { get; set; }

                [DataMember(Name = "width")]
                public double w { get; set; }

                [DataMember(Name = "height")]
                public double h { get; set; }
            }

            public Entity()
            {
                tag = new Tag();
                box = new Box();
            }
        }

        public LVAEntity()
        {
            entity = new Entity();
        }
    }
}