using RetailDemo.Core.SharedKernel;

namespace RetailDemo.Core.Interfaces
{
    public interface IDomainEventDispatcher
    {
        void Dispatch(BaseDomainEvent domainEvent);
    }
}