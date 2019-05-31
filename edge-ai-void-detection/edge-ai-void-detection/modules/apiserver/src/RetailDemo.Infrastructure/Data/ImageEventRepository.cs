using RetailDemo.Core.Interfaces;
using RetailDemo.Core.SharedKernel;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using RetailDemo.Core.Entities;

namespace RetailDemo.Infrastructure.Data
{
    public class ImageEventRepository : EfRepository, IImageEventRepository
    {
        private readonly AppDbContext _dbContext;

        public ImageEventRepository(AppDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public ImageEvent GetLast(string edgeDeviceName)
        {
            var imageEvent = _dbContext.ImageEvents
                .Where(i => i.EdgeDeviceName.Contains(edgeDeviceName))
                .LastOrDefault();

            return imageEvent;
        }
    }
}
