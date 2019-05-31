using RetailDemo.Core.Entities;
using RetailDemo.Core.SharedKernel;
using System.Collections.Generic;

namespace RetailDemo.Core.Interfaces
{
    public interface IImageEventRepository : IRepository
    {
        ImageEvent GetLast(string edgeDeviceName);
    }
}
