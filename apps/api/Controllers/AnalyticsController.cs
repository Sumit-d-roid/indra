using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public sealed class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
{
    [HttpGet("evolution")]
    [ProducesResponseType<EvolutionAnalyticsResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<EvolutionAnalyticsResponse>> Evolution(CancellationToken cancellationToken) =>
        Ok(await analyticsService.GetEvolutionAsync(cancellationToken));
}
