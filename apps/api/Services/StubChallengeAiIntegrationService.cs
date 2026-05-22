namespace Indra.Api.Services;

public sealed class StubChallengeAiIntegrationService : IChallengeAiIntegrationService
{
    public Task<AiChallengeSynthesisResult> SynthesizeAsync(AiChallengeSynthesisRequest request, CancellationToken cancellationToken = default)
    {
        var prompt = $"{request.Prompt}\n\n[Mutation vector: {request.MutationDirective}]";
        return Task.FromResult(new AiChallengeSynthesisResult(prompt, "indra-mutation-stub-v2", "Deterministic local synthesis for future AI bridge compatibility."));
    }
}
