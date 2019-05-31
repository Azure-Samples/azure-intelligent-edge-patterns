using RetailDemo.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using RetailDemo.Core.Entities;
using RetailDemo.Core.SharedKernel;

namespace RetailDemo.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        private readonly IDomainEventDispatcher _dispatcher;

        public AppDbContext(DbContextOptions<AppDbContext> options, IDomainEventDispatcher dispatcher)
            : base(options)
        {
            _dispatcher = dispatcher;
        }

        public DbSet<ImageEvent> ImageEvents { get; set; }
        public DbSet<EdgeDevice> EdgeDevices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ImageEvent>()
                .HasOne(i => i.Body);

            modelBuilder.Entity<Body>()
                .HasOne(b => b.Result);

            modelBuilder.Entity<Result>()
                .HasOne(r => r.Size);

            modelBuilder.Entity<Result>()
                .HasMany(r => r.Detection_boxes)
                .WithOne();

            modelBuilder.Entity<Result>()
                .HasMany(r => r.Detection_classes)
                .WithOne();

            modelBuilder.Entity<Result>()
                .HasMany(r => r.Detection_scores)
                .WithOne();
        }

        public override int SaveChanges()
        {
            int result = base.SaveChanges();

            // dispatch events only if save was successful
            var entitiesWithEvents = ChangeTracker.Entries<BaseEntity>()
                .Select(e => e.Entity)
                .Where(e => e.Events.Any())
                .ToArray();

            foreach (var entity in entitiesWithEvents)
            {
                var events = entity.Events.ToArray();
                entity.Events.Clear();
                foreach (var domainEvent in events)
                {
                    _dispatcher.Dispatch(domainEvent);
                }
            }

            return result;
        }
    }
}