using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/shadow-module")]
public sealed class ShadowModuleController(IShadowModuleService shadowModuleService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<FutureModuleResponse>(StatusCodes.Status200OK)]
    public ActionResult<FutureModuleResponse> Get() => Ok(shadowModuleService.GetStatus());
}
