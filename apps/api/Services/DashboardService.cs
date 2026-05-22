using Indra.Api.Contracts;
using Indra.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Services;

public sealed class DashboardService(IndraDbContext dbContext) : IDashboardService
{
    public async Task<DashboardSummaryResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstAsync(cancellationToken);
        var latestEntry = await dbContext.CognitiveEntries
            .OrderByDescending(entry => entry.CreatedAtUtc)
            .Select(entry => new CognitiveEntryResponse(
                entry.Id,
                entry.CreatedAtUtc,
                entry.SleepQuality,
                entry.FocusLevel,
                entry.CuriosityLevel,
                entry.Energy,
                entry.Mood,
                entry.MentalSharpness,
                entry.Creativity,
                entry.Stress,
                entry.Motivation,
                entry.IntellectualExcitement,
                entry.EmotionalState))
            .FirstOrDefaultAsync(cancellationToken);

        var recentChallenges = await dbContext.Challenges
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Take(3)
            .Select(challenge => new ChallengeResponseItem(challenge.Id, challenge.Category, challenge.Title, challenge.Prompt, challenge.Difficulty, challenge.NoveltyIndex))
            .ToListAsync(cancellationToken);

        var notifications = await dbContext.TrendSnapshots
            .OrderByDescending(snapshot => snapshot.CreatedAtUtc)
            .Take(3)
            .Select(snapshot => new SystemNotificationResponse(snapshot.Title, snapshot.Summary))
            .ToListAsync(cancellationToken);

        var metrics = await dbContext.CognitiveMetrics
            .OrderByDescending(metric => metric.Value)
            .Take(3)
            .Select(metric => new MetricResponse(metric.MetricName, metric.Value, metric.Insight))
            .ToListAsync(cancellationToken);

        return new DashboardSummaryResponse(
            new UserProfileResponse(user.Id, user.Username, user.Email, user.DisplayName, user.CognitiveFocus),
            latestEntry,
            recentChallenges,
            notifications,
            metrics);
    }
}
