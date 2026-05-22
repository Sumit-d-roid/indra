using Indra.Api.Contracts;
using Indra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/challenges")]
public sealed class ChallengesController(IChallengeService challengeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<ChallengeResponseItem>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ChallengeResponseItem>>> Get(CancellationToken cancellationToken) =>
        Ok(await challengeService.GetChallengesAsync(cancellationToken));

    [HttpGet("history")]
    [ProducesResponseType<IReadOnlyCollection<ChallengeHistoryItem>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ChallengeHistoryItem>>> History(CancellationToken cancellationToken) =>
        Ok(await challengeService.GetHistoryAsync(cancellationToken));

    [HttpGet("archetypes")]
    [ProducesResponseType<IReadOnlyCollection<ChallengeArchetypeItem>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ChallengeArchetypeItem>>> Archetypes(CancellationToken cancellationToken) =>
        Ok(await challengeService.GetArchetypesAsync(cancellationToken));

    [HttpGet("analysis")]
    [ProducesResponseType<MutationDiagnosticsResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<MutationDiagnosticsResponse>> Analysis(CancellationToken cancellationToken) =>
        Ok(await challengeService.GetMutationAnalysisAsync(cancellationToken));

    [HttpPost("generate")]
    [ProducesResponseType<GeneratedChallengeResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<GeneratedChallengeResponse>> Generate(GenerateChallengeRequest request, CancellationToken cancellationToken) =>
        Ok(await challengeService.GenerateAsync(request, cancellationToken));

    [HttpPost("{challengeId:guid}/responses")]
    [ProducesResponseType<ChallengeHistoryItem>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChallengeHistoryItem>> Submit(Guid challengeId, SubmitChallengeResponseRequest request, CancellationToken cancellationToken)
    {
        var response = await challengeService.SubmitResponseAsync(challengeId, request, cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }
}
