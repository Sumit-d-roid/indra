using Indra.Api.Contracts;
using Indra.Api.Data;
using Indra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Services;

public sealed class ChallengeService(
    IndraDbContext dbContext,
    IAdaptiveChallengeMutationEngine mutationEngine,
    IChallengeAiIntegrationService aiIntegrationService) : IChallengeService
{
    public async Task<IReadOnlyCollection<ChallengeResponseItem>> GetChallengesAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Challenges
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Select(challenge => new ChallengeResponseItem(challenge.Id, challenge.Category, challenge.Title, challenge.Prompt, challenge.Difficulty, challenge.NoveltyIndex))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<ChallengeHistoryItem>> GetHistoryAsync(CancellationToken cancellationToken = default) =>
        await dbContext.ChallengeResponses
            .Include(response => response.Challenge)
            .OrderByDescending(response => response.CreatedAtUtc)
            .Select(response => new ChallengeHistoryItem(response.ChallengeId, response.Challenge!.Title, response.Challenge.Category, response.IsCompleted, response.ReflectionDepth, response.CreatedAtUtc))
            .ToListAsync(cancellationToken);

    public Task<IReadOnlyCollection<ChallengeArchetypeItem>> GetArchetypesAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(mutationEngine.GetArchetypes());

    public async Task<MutationDiagnosticsResponse> GetMutationAnalysisAsync(CancellationToken cancellationToken = default)
    {
        var challenges = await dbContext.Challenges
            .AsNoTracking()
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Take(120)
            .ToListAsync(cancellationToken);

        var responses = await dbContext.ChallengeResponses
            .AsNoTracking()
            .Include(response => response.Challenge)
            .OrderByDescending(response => response.CreatedAtUtc)
            .Take(200)
            .ToListAsync(cancellationToken);

        return mutationEngine.Analyze(challenges, responses);
    }

    public async Task<GeneratedChallengeResponse> GenerateAsync(GenerateChallengeRequest request, CancellationToken cancellationToken = default)
    {
        var challenges = await dbContext.Challenges
            .AsNoTracking()
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Take(180)
            .ToListAsync(cancellationToken);

        var responses = await dbContext.ChallengeResponses
            .AsNoTracking()
            .Include(response => response.Challenge)
            .OrderByDescending(response => response.CreatedAtUtc)
            .Take(240)
            .ToListAsync(cancellationToken);

        var result = mutationEngine.Generate(request, challenges, responses);
        var aiSynthesis = await aiIntegrationService.SynthesizeAsync(
            new AiChallengeSynthesisRequest(
                result.Category,
                result.StructureSignature,
                result.Prompt,
                result.NoveltyIndex,
                result.Difficulty,
                result.Diagnostics.MutationDirective),
            cancellationToken);

        var challenge = new Challenge
        {
            Category = result.Category,
            Title = result.Title,
            Prompt = aiSynthesis.Prompt,
            Difficulty = result.Difficulty,
            IsAdaptive = true,
            NoveltyIndex = result.NoveltyIndex
        };

        dbContext.Challenges.Add(challenge);
        dbContext.AiInteractions.Add(new AiInteraction
        {
            InteractionType = "adaptive-mutation-generation",
            Prompt = request.FocusArea ?? request.CurrentPattern ?? "broad neuroplastic mutation request",
            Response = $"{result.GenerationRationale} | {aiSynthesis.Notes}",
            Model = aiSynthesis.Model
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new GeneratedChallengeResponse(
            new ChallengeResponseItem(challenge.Id, challenge.Category, challenge.Title, challenge.Prompt, challenge.Difficulty, challenge.NoveltyIndex),
            result.GenerationRationale,
            result.Diagnostics);
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

        var adaptationSnapshot = new AdaptationScore
        {
            CognitiveResonance = Math.Round(58m + (request.ReflectionDepth * 3.4m) + (request.IsCompleted ? 8.5m : -2m), 2),
            PatternEntropy = Math.Round(50m + (challenge.NoveltyIndex * 35m) + (request.ReflectionDepth * 1.2m), 2),
            AbstractionDepth = Math.Round(52m + (request.ReflectionDepth * 4.1m) + (challenge.Difficulty * 1.6m), 2)
        };

        dbContext.AdaptationScores.Add(adaptationSnapshot);
        dbContext.AiInteractions.Add(new AiInteraction
        {
            InteractionType = "challenge-response-analysis",
            Prompt = challenge.Title,
            Response = $"ReflectionDepth={request.ReflectionDepth}; Completed={request.IsCompleted}; ChallengeNovelty={challenge.NoveltyIndex}",
            Model = "indra-mutation-stub-v2"
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new ChallengeHistoryItem(challenge.Id, challenge.Title, challenge.Category, response.IsCompleted, response.ReflectionDepth, response.CreatedAtUtc);
    }
}
