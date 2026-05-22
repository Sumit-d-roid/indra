using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class CognitiveEntry : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public int SleepQuality { get; set; }
    public int FocusLevel { get; set; }
    public int CuriosityLevel { get; set; }
    public int Energy { get; set; }
    public int Mood { get; set; }
    public int MentalSharpness { get; set; }
    public int Creativity { get; set; }
    public int Stress { get; set; }
    public int Motivation { get; set; }
    public int IntellectualExcitement { get; set; }

    [MaxLength(120)]
    public string EmotionalState { get; set; } = string.Empty;
}
