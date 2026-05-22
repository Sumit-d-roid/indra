using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("summary")]
    [ProducesResponseType<DashboardSummaryResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardSummaryResponse>> Summary(CancellationToken cancellationToken) =>
        Ok(await dashboardService.GetAsync(cancellationToken));
}
