using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface IAnalyticsService
{
    Task<EvolutionAnalyticsResponse> GetEvolutionAsync(CancellationToken cancellationToken = default);
}
