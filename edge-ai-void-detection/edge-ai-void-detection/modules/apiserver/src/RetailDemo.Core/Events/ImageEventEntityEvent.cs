using RetailDemo.Core.Entities;
using RetailDemo.Core.SharedKernel;

namespace RetailDemo.Core.Events
{
    public class ImageEventEntityEvent : BaseDomainEvent
    {
        public ImageEvent CompletedItem { get; set; }

        public ImageEventEntityEvent(ImageEvent item)
        {
            // For future functionality
        }
    }
}