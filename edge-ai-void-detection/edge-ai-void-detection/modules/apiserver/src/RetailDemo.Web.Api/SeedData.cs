using RetailDemo.Core.Entities;
using RetailDemo.Infrastructure.Data;

namespace RetailDemo.Web
{
    public static class SeedData
    {
        public static void PopulateTestData(AppDbContext dbContext)
        {
            // ImageEvents Test data
            var imageEvents = dbContext.ImageEvents;
            foreach (var item in imageEvents)
            {
                dbContext.Remove(item);
            }
            dbContext.SaveChanges();
            dbContext.ImageEvents.Add(new ImageEvent()
            {
                Name = "Test"
            });
            dbContext.ImageEvents.Add(new ImageEvent()
            {
                Name = "Test2"
            });
            dbContext.SaveChanges();
        }

    }
}
