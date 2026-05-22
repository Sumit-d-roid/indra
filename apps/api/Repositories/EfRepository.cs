using Indra.Api.Data;
using Indra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Repositories;

public sealed class EfRepository<T>(IndraDbContext dbContext) : IRepository<T> where T : BaseEntity
{
    private readonly DbSet<T> _set = dbContext.Set<T>();

    public IQueryable<T> Query() => _set.AsQueryable();

    public Task<T?> GetAsync(Guid id, CancellationToken cancellationToken = default) =>
        _set.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _set.AddAsync(entity, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);
}
