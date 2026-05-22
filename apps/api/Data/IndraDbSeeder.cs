using Indra.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Data;

public static class IndraDbSeeder
{
    public static async Task SeedAsync(IndraDbContext dbContext)
    {
        if (await dbContext.Users.AnyAsync())
        {
            return;
        }

        var user = new User
        {
            Username = "observer",
            Email = "observer@indra.local",
            DisplayName = "Primary Observer",
            CognitiveFocus = "Neuroplasticity / Systems Imagination"
        };

        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, "Indra!2026");

        var nodes = new[]
        {
            new CuriosityNode { Topic = "Neuroscience", Cluster = "Biology", EngagementWeight = 0.94m, AdjacentDomain = "Architecture", DriftSignal = "Synaptic metaphor expansion" },
            new CuriosityNode { Topic = "Philosophy", Cluster = "Metaphysics", EngagementWeight = 0.87m, AdjacentDomain = "Game Theory", DriftSignal = "Meaning recursion spike" },
            new CuriosityNode { Topic = "Cybernetics", Cluster = "Systems", EngagementWeight = 0.92m, AdjacentDomain = "Mythology", DriftSignal = "Feedback ritual convergence" },
            new CuriosityNode { Topic = "Simulation Theory", Cluster = "Speculation", EngagementWeight = 0.74m, AdjacentDomain = "Geopolitics", DriftSignal = "Scenario density rising" },
            new CuriosityNode { Topic = "AI", Cluster = "Intelligence", EngagementWeight = 0.98m, AdjacentDomain = "Psychology", DriftSignal = "Adversarial reflection forming" }
        };

        var challenges = new[]
        {
            new Challenge { Category = "Interdisciplinary Synthesis", Title = "Telepathic Civil Design", Prompt = "Design a civilization optimized for telepathic communication, then identify the first hidden failure mode it would create.", Difficulty = 4, IsAdaptive = true, NoveltyIndex = 0.91m },
            new Challenge { Category = "Perspective Inversion", Title = "Forest Capitalism", Prompt = "Explain capitalism using forest ecology, then invert the analogy until it becomes a critique of scarcity itself.", Difficulty = 3, IsAdaptive = true, NoveltyIndex = 0.82m },
            new Challenge { Category = "Strategic Thinking", Title = "Immortal Politics", Prompt = "Design a political system for immortal humans and show how boredom becomes a constitutional threat.", Difficulty = 5, IsAdaptive = true, NoveltyIndex = 0.95m }
        };

        var metrics = new[]
        {
            new CognitiveMetric { MetricName = "Pattern Entropy", Value = 78.4m, Insight = "Curiosity vectors remain diversified across adjacent domains." },
            new CognitiveMetric { MetricName = "Conceptual Density", Value = 64.2m, Insight = "High clustering around systems thinking and speculative design." },
            new CognitiveMetric { MetricName = "Novelty Exposure", Value = 52.8m, Insight = "Introduce unfamiliar political or biological metaphors." }
        };

        var adaptationScores = new[]
        {
            new AdaptationScore { CognitiveResonance = 81.4m, PatternEntropy = 76.3m, AbstractionDepth = 88.1m },
            new AdaptationScore { CognitiveResonance = 84.9m, PatternEntropy = 79.6m, AbstractionDepth = 89.5m }
        };

        var snapshots = new[]
        {
            new TrendSnapshot { Title = "Curiosity divergence detected", Summary = "Recurring philosophy prompts are now branching into infrastructure and ecology.", Indicator = "divergence" },
            new TrendSnapshot { Title = "Pattern rigidity increasing", Summary = "Abstract reasoning remains strong, but novelty tolerance dipped over the last two cycles.", Indicator = "rigidity" },
            new TrendSnapshot { Title = "Creative volatility elevated", Summary = "Challenge responses show stronger metaphor density and more conceptual leaps.", Indicator = "volatility" }
        };

        var entry = new CognitiveEntry
        {
            User = user,
            SleepQuality = 7,
            FocusLevel = 8,
            CuriosityLevel = 9,
            Energy = 6,
            Mood = 7,
            MentalSharpness = 8,
            Creativity = 9,
            Stress = 4,
            Motivation = 8,
            IntellectualExcitement = 10,
            EmotionalState = "quietly electrified"
        };

        var aiInteraction = new AiInteraction
        {
            InteractionType = "challenge-generation",
            Prompt = "Generate an interdisciplinary collision for a user exploring cybernetics and mythology.",
            Response = "Design a ritual protocol that an autonomous city uses to regulate feedback loops during a solar storm.",
            Model = "indra-stub-v1"
        };

        dbContext.Users.Add(user);
        dbContext.CognitiveEntries.Add(entry);
        dbContext.Challenges.AddRange(challenges);
        dbContext.CuriosityNodes.AddRange(nodes);
        dbContext.CuriosityConnections.AddRange(
            new CuriosityConnection { SourceNode = nodes[0], TargetNode = nodes[2], Weight = 0.82m, RelationshipType = "feedback-loop" },
            new CuriosityConnection { SourceNode = nodes[1], TargetNode = nodes[3], Weight = 0.68m, RelationshipType = "speculative-framing" },
            new CuriosityConnection { SourceNode = nodes[2], TargetNode = nodes[4], Weight = 0.91m, RelationshipType = "adaptive-intelligence" },
            new CuriosityConnection { SourceNode = nodes[4], TargetNode = nodes[0], Weight = 0.72m, RelationshipType = "cognitive-modeling" });
        dbContext.CognitiveMetrics.AddRange(metrics);
        dbContext.AdaptationScores.AddRange(adaptationScores);
        dbContext.TrendSnapshots.AddRange(snapshots);
        dbContext.AiInteractions.Add(aiInteraction);

        await dbContext.SaveChangesAsync();
    }
}
