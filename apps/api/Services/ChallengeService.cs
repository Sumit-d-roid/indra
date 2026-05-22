using Indra.Api.Contracts;
using Indra.Api.Data;
using Indra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Services;

public sealed class ChallengeService(IndraDbContext dbContext) : IChallengeService
{
    private static readonly IReadOnlyDictionary<string, string[]> PromptBank = new Dictionary<string, string[]>
    {
        ["abstract reasoning"] =
        [
            "Imagine mathematics is illegal for one century. Which substitute symbolic systems emerge first, and why?",
            "Design a map legend for thoughts that cannot be verbalized directly."
        ],
        ["systems thinking"] =
        [
            "How would ant colony behavior improve city infrastructure under water scarcity?",
            "Invent a transit system designed around emotional weather instead of traffic volume."
        ],
        ["perspective inversion"] =
        [
            "What happens if memory becomes tradeable but forgetting becomes a luxury service?",
            "Describe a university built to maximize confusion before clarity."
        ]
    };

    public async Task<IReadOnlyCollection<ChallengeResponseItem>> GetChallengesAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Challenges
            .OrderByDescending(challenge => challenge.NoveltyIndex)
            .Select(challenge => new ChallengeResponseItem(challenge.Id, challenge.Category, challenge.Title, challenge.Prompt, challenge.Difficulty, challenge.NoveltyIndex))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<ChallengeHistoryItem>> GetHistoryAsync(CancellationToken cancellationToken = default) =>
        await dbContext.ChallengeResponses
            .Include(response => response.Challenge)
            .OrderByDescending(response => response.CreatedAtUtc)
            .Select(response => new ChallengeHistoryItem(response.ChallengeId, response.Challenge!.Title, response.Challenge.Category, response.IsCompleted, response.ReflectionDepth, response.CreatedAtUtc))
            .ToListAsync(cancellationToken);

    public async Task<GeneratedChallengeResponse> GenerateAsync(GenerateChallengeRequest request, CancellationToken cancellationToken = default)
    {
        var responseCount = await dbContext.ChallengeResponses.CountAsync(cancellationToken);
        var category = SelectCategory(request.FocusArea, responseCount);
        var prompt = PromptBank[category][responseCount % PromptBank[category].Length];
        var challenge = new Challenge
        {
            Category = ToTitleCase(category),
            Title = $"Adaptive Matrix {(responseCount + 1):D2}",
            Prompt = prompt,
            Difficulty = request.PreferredDifficulty ?? Math.Clamp(3 + (responseCount % 3), 2, 5),
            IsAdaptive = true,
            NoveltyIndex = 0.75m + ((responseCount % 5) * 0.04m)
        };

        dbContext.Challenges.Add(challenge);
        dbContext.AiInteractions.Add(new AiInteraction
        {
            InteractionType = "adaptive-generation",
            Prompt = request.FocusArea ?? "broad-spectrum curiosity",
            Response = prompt,
            Model = "indra-stub-v1"
        });
        await dbContext.SaveChangesAsync(cancellationToken);

        return new GeneratedChallengeResponse(
            new ChallengeResponseItem(challenge.Id, challenge.Category, challenge.Title, challenge.Prompt, challenge.Difficulty, challenge.NoveltyIndex),
            $"Challenge difficulty tuned against {responseCount} prior response cycles and focus bias '{request.CurrentPattern ?? "unconstrained exploration"}'.");
    }

    public async Task<ChallengeHistoryItem?> SubmitResponseAsync(Guid challengeId, SubmitChallengeResponseRequest request, CancellationToken cancellationToken = default)
    {
        var challenge = await dbContext.Challenges.FirstOrDefaultAsync(item => item.Id == challengeId, cancellationToken);
        var user = await dbContext.Users.FirstOrDefaultAsync(cancellationToken);
        if (challenge is null || user is null)
        {
            return null;
        }

        var response = new ChallengeResponse
        {
            ChallengeId = challengeId,
            UserId = user.Id,
            ResponseText = request.ResponseText,
            ReflectionDepth = request.ReflectionDepth,
            IsCompleted = request.IsCompleted
        };

        dbContext.ChallengeResponses.Add(response);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ChallengeHistoryItem(challenge.Id, challenge.Title, challenge.Category, response.IsCompleted, response.ReflectionDepth, response.CreatedAtUtc);
    }

    private static string SelectCategory(string? focusArea, int responseCount)
    {
        if (!string.IsNullOrWhiteSpace(focusArea))
        {
            var normalized = focusArea.Trim().ToLowerInvariant();
            return PromptBank.Keys.FirstOrDefault(key => normalized.Contains(key.Split(' ')[0])) ?? PromptBank.Keys.ElementAt(responseCount % PromptBank.Count);
        }

        return PromptBank.Keys.ElementAt(responseCount % PromptBank.Count);
    }

    private static string ToTitleCase(string value) => string.Join(' ', value.Split(' ').Select(part => char.ToUpperInvariant(part[0]) + part[1..]));
}
