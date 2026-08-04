using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Country> Countries => Set<Country>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Confederation).HasConversion<string>();
        });
    }
}