using Indra.Api.Contracts;
using Indra.Api.Models;

namespace Indra.Api.Services;

public sealed class AdaptiveChallengeMutationEngine : IAdaptiveChallengeMutationEngine
{
    private static readonly IReadOnlyCollection<ChallengeArchetypeItem> Archetypes =
    [
        new("Systems Thinking", "feedback-architecture", "multi-order effects", 4, 0.72m),
        new("Philosophy", "axiom-collapse", "ontological instability", 5, 0.78m),
        new("Abstract Reasoning", "symbolic-transposition", "compression under ambiguity", 5, 0.79m),
        new("Perspective Inversion", "agent-role-reversal", "identity destabilization", 4, 0.74m),
        new("Strategic Thinking", "adversarial-futures", "long-horizon competition", 5, 0.76m),
        new("Paradoxes", "self-reference-trap", "coherence under contradiction", 6, 0.82m),
        new("Interdisciplinary Synthesis", "domain-collision", "conceptual transfer", 5, 0.81m),
        new("Simulated Civilizations", "civilization-parameter-mutation", "macro-systems adaptation", 6, 0.83m),
        new("Impossible Scenarios", "constraint-impossibility", "logic against impossible priors", 7, 0.88m),
        new("Conceptual Compression", "theory-packing", "high-density abstraction", 6, 0.84m),
        new("Creativity Stress Tests", "novelty-overload", "ideation under pressure", 5, 0.8m)
    ];

    public IReadOnlyCollection<ChallengeArchetypeItem> GetArchetypes() => Archetypes;

    public MutationDiagnosticsResponse Analyze(IReadOnlyCollection<Challenge> challenges, IReadOnlyCollection<ChallengeResponse> responses)
    {
        var recentChallenges = challenges
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Take(18)
            .ToList();

        var recentResponses = responses
            .OrderByDescending(response => response.CreatedAtUtc)
            .Take(24)
            .ToList();

        var categoryCounts = recentChallenges
            .GroupBy(challenge => challenge.Category)
            .ToDictionary(group => group.Key, group => group.Count());

        var totalChallenges = Math.Max(1, recentChallenges.Count);
        var maxShare = categoryCounts.Count == 0 ? 0m : categoryCounts.Values.Max() / (decimal)totalChallenges;
        var overSpecialized = maxShare >= 0.45m;
        var comfortZones = categoryCounts
            .Where(pair => pair.Value >= Math.Max(2, (int)Math.Ceiling(totalChallenges * 0.22m)))
            .OrderByDescending(pair => pair.Value)
            .Take(3)
            .Select(pair => pair.Key)
            .ToArray();

        var repetitivePatterns = DetectRepetitivePatterns(recentResponses);
        var structuralVariation = ComputeStructuralVariation(recentChallenges);
        var categoryEntropy = ComputeNormalizedEntropy(categoryCounts.Values.ToList());
        var categoryCoverage = Math.Round(categoryCounts.Count / (decimal)Archetypes.Count, 3);
        var flexibilityIndex = Math.Round(Math.Clamp((categoryEntropy * 0.4m) + (structuralVariation * 0.35m) + ((1m - maxShare) * 0.25m), 0.10m, 0.99m), 3);

        var noveltyScore = Math.Round(Math.Clamp((categoryEntropy * 0.45m) + (structuralVariation * 0.35m) + ((1m - maxShare) * 0.20m), 0.20m, 0.99m), 3);
        var abstractionPressure = Math.Round(Math.Clamp(0.42m + (repetitivePatterns.Length * 0.1m) + (overSpecialized ? 0.15m : 0m), 0.30m, 0.98m), 3);

        return new MutationDiagnosticsResponse(
            repetitivePatterns,
            comfortZones,
            overSpecialized,
            noveltyScore,
            abstractionPressure,
            new CognitiveDiversityMetrics(categoryEntropy, categoryCoverage, structuralVariation, Math.Round(maxShare, 3), flexibilityIndex),
            BuildMutationDirective(overSpecialized, repetitivePatterns.Length, categoryCoverage));
    }

    public MutationGenerationResult Generate(
        GenerateChallengeRequest request,
        IReadOnlyCollection<Challenge> challenges,
        IReadOnlyCollection<ChallengeResponse> responses)
    {
        var diagnostics = Analyze(challenges, responses);
        var recentChallenges = challenges
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .Take(12)
            .ToList();

        var selectedArchetype = SelectArchetype(request, diagnostics, recentChallenges);
        var indexSeed = challenges.Count + responses.Count + DateTime.UtcNow.Day;
        var prompt = BuildPrompt(selectedArchetype, request, indexSeed, diagnostics);
        var difficulty = SelectDifficulty(request, selectedArchetype.BaseDifficulty, challenges.Count, diagnostics);
        var requestedNovelty = request.NoveltyTarget ?? Math.Clamp(selectedArchetype.BaseNovelty + (diagnostics.OverSpecialized ? 0.08m : 0m), 0.25m, 0.98m);
        var novelty = ComputePromptNovelty(prompt, selectedArchetype.Category, selectedArchetype.StructureSignature, recentChallenges, requestedNovelty);
        var cycle = challenges.Count + 1;

        return new MutationGenerationResult(
            selectedArchetype.Category,
            $"Mutation Cycle {cycle:D3} · {selectedArchetype.StructureSignature}",
            prompt,
            difficulty,
            novelty,
            selectedArchetype.StructureSignature,
            diagnostics with { NoveltyScore = novelty },
            $"Generated via {selectedArchetype.StructureSignature} with pressure style '{selectedArchetype.PressureStyle}'.");
    }

    private static ChallengeArchetypeItem SelectArchetype(
        GenerateChallengeRequest request,
        MutationDiagnosticsResponse diagnostics,
        IReadOnlyCollection<Challenge> recentChallenges)
    {
        if (!string.IsNullOrWhiteSpace(request.FocusArea))
        {
            var focus = request.FocusArea.Trim().ToLowerInvariant();
            var focused = Archetypes.FirstOrDefault(archetype => focus.Contains(archetype.Category.ToLowerInvariant().Split(' ')[0]));
            if (focused is not null)
            {
                return focused;
            }
        }

        var recentSignatures = recentChallenges
            .Select(challenge => InferStructureSignature(challenge.Prompt))
            .Where(signature => !string.IsNullOrWhiteSpace(signature))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var candidate = Archetypes
            .Where(archetype => !recentSignatures.Contains(archetype.StructureSignature))
            .OrderByDescending(archetype => archetype.BaseNovelty)
            .FirstOrDefault();

        if (candidate is not null)
        {
            return candidate;
        }

        return diagnostics.OverSpecialized
            ? Archetypes.OrderByDescending(archetype => archetype.BaseNovelty).First()
            : Archetypes.OrderBy(archetype => archetype.BaseDifficulty).First();
    }

    private static string BuildPrompt(
        ChallengeArchetypeItem archetype,
        GenerateChallengeRequest request,
        int indexSeed,
        MutationDiagnosticsResponse diagnostics)
    {
        var pressure = request.CurrentPattern ?? diagnostics.MutationDirective;
        return archetype.StructureSignature switch
        {
            "feedback-architecture" => $"Design a self-correcting system where each optimization creates a hidden second-order failure, then describe the governance protocol that prevents collapse under recursive side-effects. Current pressure vector: {pressure}.",
            "axiom-collapse" => $"Begin with one philosophical axiom you trust, mutate it three times until it contradicts itself, then reconstruct a worldview that still permits coherent action. Pattern under inspection: {pressure}.",
            "symbolic-transposition" => $"Compress a social conflict into symbols with no nouns, then decode those symbols into a strategy memo for a civilization that has no written language. Compression pressure: {pressure}.",
            "agent-role-reversal" => $"Argue from the perspective of the system that currently controls you, then invert roles and show how your previous argument becomes a blind spot. Dominant pattern: {pressure}.",
            "adversarial-futures" => $"Model two rival strategic actors over 50 years where both can edit memory archives, and propose a doctrine that remains robust when historical records are weaponized. Strategic pressure: {pressure}.",
            "self-reference-trap" => $"Construct a paradox where solving the paradox increases its complexity, then define a protocol for reasoning without demanding full resolution. Cognitive trap signature: {pressure}.",
            "domain-collision" => $"Fuse two unrelated fields into a single design brief and identify the first emergent failure mode: {'"'}{PickDomain(indexSeed)}{'"'} with {'"'}{PickDomain(indexSeed + 7)}{'"'}. Collision pressure: {pressure}.",
            "civilization-parameter-mutation" => $"Simulate a civilization by mutating one foundational parameter every decade (law, language, memory, biology, energy). Predict the tipping point where adaptation outpaces identity. Parameter pressure: {pressure}.",
            "constraint-impossibility" => $"Solve an impossible policy problem where every valid solution violates a core physical constraint, then defend the least incoherent option. Constraint pressure: {pressure}.",
            "theory-packing" => $"Compress your model of intelligence into five linked rules that can explain creativity, ideology, and institutional decay simultaneously. Packing pressure: {pressure}.",
            _ => $"Generate twelve original ideas for a society-wide crisis in under ten minutes, then reduce them to one resilient strategy without losing novelty. Stress pressure: {pressure}."
        };
    }

    private static int SelectDifficulty(
        GenerateChallengeRequest request,
        int baseDifficulty,
        int historicalCount,
        MutationDiagnosticsResponse diagnostics)
    {
        var preferred = request.PreferredDifficulty ?? baseDifficulty;
        var nonlinearStep = Math.Sqrt(historicalCount + 1) * 0.65 + Math.Log2(historicalCount + 2) * 0.35;
        var mutationPressure = (request.MutationIntensity ?? 5) / 10m;
        var specializationSpike = diagnostics.OverSpecialized ? 1.2m : 0m;
        var complexity = preferred + (decimal)nonlinearStep + (mutationPressure * 1.7m) + specializationSpike;
        return (int)Math.Clamp(Math.Round(complexity, MidpointRounding.AwayFromZero), 2, 10);
    }

    private static decimal ComputePromptNovelty(
        string prompt,
        string category,
        string structureSignature,
        IReadOnlyCollection<Challenge> recentChallenges,
        decimal requestedTarget)
    {
        if (recentChallenges.Count == 0)
        {
            return Math.Round(Math.Clamp(requestedTarget, 0.20m, 0.99m), 3);
        }

        var promptTokens = Tokenize(prompt);
        var recentTokens = recentChallenges
            .SelectMany(challenge => Tokenize(challenge.Prompt))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var overlap = promptTokens.Count == 0 ? 0m : promptTokens.Count(token => recentTokens.Contains(token)) / (decimal)promptTokens.Count;
        var lexicalNovelty = 1m - overlap;
        var categoryRarity = 1m - (recentChallenges.Count(challenge => challenge.Category == category) / (decimal)recentChallenges.Count);
        var structuralRarity = 1m - (recentChallenges.Count(challenge => string.Equals(InferStructureSignature(challenge.Prompt), structureSignature, StringComparison.OrdinalIgnoreCase)) / (decimal)recentChallenges.Count);
        var computed = (lexicalNovelty * 0.45m) + (categoryRarity * 0.30m) + (structuralRarity * 0.25m);
        return Math.Round(Math.Clamp((requestedTarget * 0.35m) + (computed * 0.65m), 0.20m, 0.99m), 3);
    }

    private static string[] DetectRepetitivePatterns(IReadOnlyCollection<ChallengeResponse> responses)
    {
        if (responses.Count == 0)
        {
            return [];
        }

        var markers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["causal-loop framing"] = responses.Count(response => ContainsAny(response.ResponseText, "because", "therefore", "if", "hence")),
            ["optimization framing"] = responses.Count(response => ContainsAny(response.ResponseText, "optimize", "efficiency", "maximize", "minimize")),
            ["systems framing"] = responses.Count(response => ContainsAny(response.ResponseText, "system", "feedback", "network", "dynamics")),
            ["abstraction framing"] = responses.Count(response => ContainsAny(response.ResponseText, "metaphor", "symbol", "model", "abstraction"))
        };

        var threshold = Math.Max(2, (int)Math.Ceiling(responses.Count * 0.45m));
        return markers
            .Where(pair => pair.Value >= threshold)
            .OrderByDescending(pair => pair.Value)
            .Select(pair => pair.Key)
            .Take(3)
            .ToArray();
    }

    private static decimal ComputeStructuralVariation(IReadOnlyCollection<Challenge> challenges)
    {
        if (challenges.Count == 0)
        {
            return 1m;
        }

        var uniqueSignatures = challenges
            .Select(challenge => InferStructureSignature(challenge.Prompt))
            .Where(signature => !string.IsNullOrWhiteSpace(signature))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        return Math.Round(Math.Clamp(uniqueSignatures / (decimal)Math.Max(1, Archetypes.Count), 0.10m, 1m), 3);
    }

    private static decimal ComputeNormalizedEntropy(IReadOnlyCollection<int> counts)
    {
        if (counts.Count <= 1)
        {
            return counts.Count == 0 ? 0.25m : 0.15m;
        }

        var total = counts.Sum();
        if (total <= 0)
        {
            return 0.25m;
        }

        decimal entropy = 0m;
        foreach (var count in counts)
        {
            if (count <= 0)
            {
                continue;
            }

            var p = count / (decimal)total;
            entropy -= p * (decimal)Math.Log((double)p, 2);
        }

        var maxEntropy = (decimal)Math.Log(counts.Count, 2);
        return maxEntropy <= 0m
            ? 0.20m
            : Math.Round(Math.Clamp(entropy / maxEntropy, 0.10m, 1m), 3);
    }

    private static string BuildMutationDirective(bool overSpecialized, int repetitivePatternCount, decimal categoryCoverage)
    {
        if (overSpecialized)
        {
            return "force cross-domain inversion and introduce hostile abstraction jumps";
        }

        if (repetitivePatternCount >= 2)
        {
            return "disrupt dominant reasoning style with paradox and perspective mutations";
        }

        if (categoryCoverage < 0.35m)
        {
            return "expand into under-sampled categories with controlled novelty pressure";
        }

        return "increase abstraction gradually while preserving strategic coherence";
    }

    private static bool ContainsAny(string source, params string[] candidates)
    {
        if (string.IsNullOrWhiteSpace(source))
        {
            return false;
        }

        return candidates.Any(candidate => source.Contains(candidate, StringComparison.OrdinalIgnoreCase));
    }

    private static IReadOnlyCollection<string> Tokenize(string value) =>
        value
            .Split([' ', ',', '.', ':', ';', '-', '?', '!', '\n', '\r', '\t', '(', ')'], StringSplitOptions.RemoveEmptyEntries)
            .Select(token => token.Trim().ToLowerInvariant())
            .Where(token => token.Length > 3)
            .Distinct()
            .ToArray();

    private static string InferStructureSignature(string prompt)
    {
        if (ContainsAny(prompt, "design a self-correcting system", "second-order"))
        {
            return "feedback-architecture";
        }

        if (ContainsAny(prompt, "axiom", "worldview"))
        {
            return "axiom-collapse";
        }

        if (ContainsAny(prompt, "compress", "symbols"))
        {
            return "symbolic-transposition";
        }

        if (ContainsAny(prompt, "invert", "perspective"))
        {
            return "agent-role-reversal";
        }

        if (ContainsAny(prompt, "civilization", "decade"))
        {
            return "civilization-parameter-mutation";
        }

        if (ContainsAny(prompt, "impossible", "constraint"))
        {
            return "constraint-impossibility";
        }

        if (ContainsAny(prompt, "paradox"))
        {
            return "self-reference-trap";
        }

        if (ContainsAny(prompt, "fuse", "emergent failure mode"))
        {
            return "domain-collision";
        }

        if (ContainsAny(prompt, "five linked rules"))
        {
            return "theory-packing";
        }

        return "novelty-overload";
    }

    private static string PickDomain(int seed)
    {
        var domains = new[]
        {
            "urban planning",
            "mythic ritual design",
            "distributed computing",
            "marine ecology",
            "constitutional law",
            "linguistic anthropology",
            "quantum thermodynamics",
            "collective psychology"
        };

        return domains[Math.Abs(seed) % domains.Length];
    }
}
