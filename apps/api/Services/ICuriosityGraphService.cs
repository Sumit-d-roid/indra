using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface ICuriosityGraphService
{
    Task<CuriosityGraphResponse> GetAsync(CancellationToken cancellationToken = default);
}
