using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetAsync(CancellationToken cancellationToken = default);
}
