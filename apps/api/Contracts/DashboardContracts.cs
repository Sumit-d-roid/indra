namespace Indra.Api.Contracts;

public sealed record SystemNotificationResponse(string Title, string Detail);
public sealed record DashboardSummaryResponse(
    UserProfileResponse Profile,
    CognitiveEntryResponse? LatestEntry,
    IReadOnlyCollection<ChallengeResponseItem> RecentChallenges,
    IReadOnlyCollection<SystemNotificationResponse> Notifications,
    IReadOnlyCollection<MetricResponse> HighlightMetrics);

public sealed record FutureModuleResponse(string Title, string Status, string Purpose, IReadOnlyCollection<string> Signals);
