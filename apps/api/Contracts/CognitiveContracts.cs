using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record CognitiveEntryRequest(
    [param: Range(1, 10)] int SleepQuality,
    [param: Range(1, 10)] int FocusLevel,
    [param: Range(1, 10)] int CuriosityLevel,
    [param: Range(1, 10)] int Energy,
    [param: Range(1, 10)] int Mood,
    [param: Range(1, 10)] int MentalSharpness,
    [param: Range(1, 10)] int Creativity,
    [param: Range(1, 10)] int Stress,
    [param: Range(1, 10)] int Motivation,
    [param: Range(1, 10)] int IntellectualExcitement,
    [param: Required, StringLength(120)] string EmotionalState);

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
