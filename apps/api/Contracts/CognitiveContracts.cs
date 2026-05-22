using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record CognitiveEntryRequest(
    [property: Range(1, 10)] int SleepQuality,
    [property: Range(1, 10)] int FocusLevel,
    [property: Range(1, 10)] int CuriosityLevel,
    [property: Range(1, 10)] int Energy,
    [property: Range(1, 10)] int Mood,
    [property: Range(1, 10)] int MentalSharpness,
    [property: Range(1, 10)] int Creativity,
    [property: Range(1, 10)] int Stress,
    [property: Range(1, 10)] int Motivation,
    [property: Range(1, 10)] int IntellectualExcitement,
    [property: Required, StringLength(120)] string EmotionalState);

public sealed record CognitiveEntryResponse(
    Guid Id,
    DateTime CreatedAtUtc,
    int SleepQuality,
    int FocusLevel,
    int CuriosityLevel,
    int Energy,
    int Mood,
    int MentalSharpness,
    int Creativity,
    int Stress,
    int Motivation,
    int IntellectualExcitement,
    string EmotionalState);
