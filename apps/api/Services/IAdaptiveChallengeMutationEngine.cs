using Indra.Api.Contracts;
using Indra.Api.Models;

namespace Indra.Api.Services;

public interface IAdaptiveChallengeMutationEngine
{
    IReadOnlyCollection<ChallengeArchetypeItem> GetArchetypes();
    MutationDiagnosticsResponse Analyze(IReadOnlyCollection<Challenge> challenges, IReadOnlyCollection<ChallengeResponse> responses);
    MutationGenerationResult Generate(
        GenerateChallengeRequest request,
        IReadOnlyCollection<Challenge> challenges,
        IReadOnlyCollection<ChallengeResponse> responses);
}

public sealed record MutationGenerationResult(
    string Category,
    string Title,
    string Prompt,
    int Difficulty,
    decimal NoveltyIndex,
    string StructureSignature,
    MutationDiagnosticsResponse Diagnostics,
    string GenerationRationale);
