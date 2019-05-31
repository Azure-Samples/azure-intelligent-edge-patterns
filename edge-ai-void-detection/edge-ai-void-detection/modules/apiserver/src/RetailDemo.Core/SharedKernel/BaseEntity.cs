using System.Collections.Generic;
using Newtonsoft.Json;

namespace RetailDemo.Core.SharedKernel
{
    // This can be modified to BaseEntity<TId> to support multiple key types (e.g. Guid)
    public abstract class BaseEntity
    {
        [JsonProperty("id", Order = 1)]
        public int Id { get; set; }

        public List<BaseDomainEvent> Events = new List<BaseDomainEvent>();
    }
}