namespace Indra.Api.Services;

public interface IChallengeAiIntegrationService
{
    Task<AiChallengeSynthesisResult> SynthesizeAsync(AiChallengeSynthesisRequest request, CancellationToken cancellationToken = default);
}

public sealed record AiChallengeSynthesisRequest(
    string Category,
    string StructureSignature,
    string Prompt,
    decimal NoveltyIndex,
    int Difficulty,
    string MutationDirective);

public sealed record AiChallengeSynthesisResult(string Prompt, string Model, string Notes);
