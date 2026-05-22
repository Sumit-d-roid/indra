using Indra.Api.Contracts;
using Indra.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Services;

public sealed class AnalyticsService(IndraDbContext dbContext) : IAnalyticsService
{
    public async Task<EvolutionAnalyticsResponse> GetEvolutionAsync(CancellationToken cancellationToken = default)
    {
        var metrics = await dbContext.CognitiveMetrics
            .OrderByDescending(metric => metric.Value)
            .Select(metric => new MetricResponse(metric.MetricName, metric.Value, metric.Insight))
            .ToListAsync(cancellationToken);

        var adaptationScores = await dbContext.AdaptationScores
            .OrderBy(score => score.CreatedAtUtc)
            .Select(score => new AdaptationScoreResponse(score.CreatedAtUtc, score.CognitiveResonance, score.PatternEntropy, score.AbstractionDepth))
            .ToListAsync(cancellationToken);

        var snapshots = await dbContext.TrendSnapshots
            .OrderByDescending(snapshot => snapshot.CreatedAtUtc)
            .Select(snapshot => new TrendSnapshotResponse(snapshot.CreatedAtUtc, snapshot.Title, snapshot.Summary, snapshot.Indicator))
            .ToListAsync(cancellationToken);

        var categoryDistribution = await dbContext.Challenges
            .GroupBy(challenge => challenge.Category)
            .Select(group => new CategoryDistributionResponse(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        return new EvolutionAnalyticsResponse(metrics, adaptationScores, snapshots, categoryDistribution);
    }
}
