using Indra.Api.Models;

namespace Indra.Api.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    IQueryable<T> Query();
    Task<T?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
