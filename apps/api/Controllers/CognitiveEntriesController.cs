using Indra.Api.Contracts;
using Indra.Api.Data;
using Indra.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Controllers;

[ApiController]
[Route("api/cognitive-entries")]
public sealed class CognitiveEntriesController(IndraDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<CognitiveEntryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<CognitiveEntryResponse>>> Get(CancellationToken cancellationToken)
    {
        var entries = await dbContext.CognitiveEntries
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
            .ToListAsync(cancellationToken);

        return Ok(entries);
    }

    [HttpPost]
    [ProducesResponseType<CognitiveEntryResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<CognitiveEntryResponse>> Create(CognitiveEntryRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstAsync(cancellationToken);
        var entry = new CognitiveEntry
        {
            UserId = user.Id,
            SleepQuality = request.SleepQuality,
            FocusLevel = request.FocusLevel,
            CuriosityLevel = request.CuriosityLevel,
            Energy = request.Energy,
            Mood = request.Mood,
            MentalSharpness = request.MentalSharpness,
            Creativity = request.Creativity,
            Stress = request.Stress,
            Motivation = request.Motivation,
            IntellectualExcitement = request.IntellectualExcitement,
            EmotionalState = request.EmotionalState
        };

        dbContext.CognitiveEntries.Add(entry);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new CognitiveEntryResponse(entry.Id, entry.CreatedAtUtc, entry.SleepQuality, entry.FocusLevel, entry.CuriosityLevel, entry.Energy, entry.Mood, entry.MentalSharpness, entry.Creativity, entry.Stress, entry.Motivation, entry.IntellectualExcitement, entry.EmotionalState);
        return CreatedAtAction(nameof(Get), new { id = entry.Id }, response);
    }
}
