using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record ChallengeResponseItem(Guid Id, string Category, string Title, string Prompt, int Difficulty, decimal NoveltyIndex);

public sealed record ChallengeHistoryItem(Guid ChallengeId, string Title, string Category, bool IsCompleted, int ReflectionDepth, DateTime CreatedAtUtc);

public sealed record ChallengeArchetypeItem(string Category, string StructureSignature, string PressureStyle, int BaseDifficulty, decimal BaseNovelty);

public sealed record CognitiveDiversityMetrics(
    decimal CategoryEntropy,
    decimal CategoryCoverage,
    decimal StructuralVariation,
    decimal OverSpecializationRisk,
    decimal FlexibilityIndex);

public sealed record MutationDiagnosticsResponse(
    IReadOnlyCollection<string> RepetitivePatterns,
    IReadOnlyCollection<string> ComfortZones,
    bool OverSpecialized,
    decimal NoveltyScore,
    decimal AbstractionPressure,
    CognitiveDiversityMetrics DiversityMetrics,
    string MutationDirective);

public sealed record GenerateChallengeRequest(
    [param: StringLength(120)] string? FocusArea,
    [param: StringLength(120)] string? CurrentPattern,
    [param: Range(1, 10)] int? PreferredDifficulty,
    [param: Range(typeof(decimal), "0.20", "0.99")] decimal? NoveltyTarget,
    [param: Range(1, 10)] int? MutationIntensity);

public sealed record SubmitChallengeResponseRequest(
    [param: Required, StringLength(4000, MinimumLength = 8)] string ResponseText,
    [param: Range(1, 10)] int ReflectionDepth,
    bool IsCompleted);

public sealed record GeneratedChallengeResponse(ChallengeResponseItem Challenge, string GenerationRationale, MutationDiagnosticsResponse Diagnostics);
