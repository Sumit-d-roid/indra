using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/labyrinth")]
public sealed class LabyrinthController(ILabyrinthService labyrinthService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<FutureModuleResponse>(StatusCodes.Status200OK)]
    public ActionResult<FutureModuleResponse> Get() => Ok(labyrinthService.GetStatus());
}
