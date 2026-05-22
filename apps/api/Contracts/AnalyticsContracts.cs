namespace Indra.Api.Contracts;

public sealed record MetricResponse(string MetricName, decimal Value, string Insight);
public sealed record AdaptationScoreResponse(DateTime CreatedAtUtc, decimal CognitiveResonance, decimal PatternEntropy, decimal AbstractionDepth);
public sealed record TrendSnapshotResponse(DateTime CreatedAtUtc, string Title, string Summary, string Indicator);
public sealed record CategoryDistributionResponse(string Category, int Count);
public sealed record EvolutionAnalyticsResponse(
    IReadOnlyCollection<MetricResponse> Metrics,
    IReadOnlyCollection<AdaptationScoreResponse> AdaptationScores,
    IReadOnlyCollection<TrendSnapshotResponse> TrendSnapshots,
    IReadOnlyCollection<CategoryDistributionResponse> ChallengeCategoryDistribution);
