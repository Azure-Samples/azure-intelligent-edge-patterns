using RetailDemo.Core.SharedKernel;

namespace RetailDemo.Core.Interfaces
{
    public interface IHandle<T> where T : BaseDomainEvent
    {
        void Handle(T domainEvent);
    }
}