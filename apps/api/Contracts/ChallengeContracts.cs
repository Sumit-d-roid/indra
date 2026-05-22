using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record ChallengeResponseItem(Guid Id, string Category, string Title, string Prompt, int Difficulty, decimal NoveltyIndex);

public sealed record ChallengeHistoryItem(Guid ChallengeId, string Title, string Category, bool IsCompleted, int ReflectionDepth, DateTime CreatedAtUtc);

public sealed record GenerateChallengeRequest(
    [property: StringLength(120)] string? FocusArea,
    [property: StringLength(120)] string? CurrentPattern,
    [property: Range(1, 5)] int? PreferredDifficulty);

public sealed record SubmitChallengeResponseRequest(
    [property: Required, StringLength(4000, MinimumLength = 8)] string ResponseText,
    [property: Range(1, 10)] int ReflectionDepth,
    bool IsCompleted);

public sealed record GeneratedChallengeResponse(ChallengeResponseItem Challenge, string GenerationRationale);
