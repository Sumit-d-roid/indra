using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface IChallengeService
{
    Task<IReadOnlyCollection<ChallengeResponseItem>> GetChallengesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ChallengeHistoryItem>> GetHistoryAsync(CancellationToken cancellationToken = default);
    Task<GeneratedChallengeResponse> GenerateAsync(GenerateChallengeRequest request, CancellationToken cancellationToken = default);
    Task<ChallengeHistoryItem?> SubmitResponseAsync(Guid challengeId, SubmitChallengeResponseRequest request, CancellationToken cancellationToken = default);
}
