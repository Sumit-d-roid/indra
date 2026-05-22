using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Indra.Api.Data;

public sealed class IndraDbContextFactory : IDesignTimeDbContextFactory<IndraDbContext>
{
    public IndraDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IndraDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=indra;Username=postgres;Password=postgres");

        return new IndraDbContext(optionsBuilder.Options);
    }
}
