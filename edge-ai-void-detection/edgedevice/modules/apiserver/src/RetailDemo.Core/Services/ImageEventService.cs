using Ardalis.GuardClauses;
using RetailDemo.Core.Events;
using RetailDemo.Core.Interfaces;

namespace RetailDemo.Core.Services
{
    public class ImageEventService : IHandle<ImageEventEntityEvent>
    {
        public void Handle(ImageEventEntityEvent domainEvent)
        {
            Guard.Against.Null(domainEvent, nameof(domainEvent));

            // Do Nothing
        }
    }
}
