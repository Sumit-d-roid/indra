using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/curiosity-graph")]
public sealed class CuriosityGraphController(ICuriosityGraphService curiosityGraphService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<CuriosityGraphResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<CuriosityGraphResponse>> Get(CancellationToken cancellationToken) =>
        Ok(await curiosityGraphService.GetAsync(cancellationToken));
}
