using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class Challenge : BaseEntity
{
    [MaxLength(80)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Prompt { get; set; } = string.Empty;

    public int Difficulty { get; set; }
    public bool IsAdaptive { get; set; }
    public decimal NoveltyIndex { get; set; }

    public ICollection<ChallengeResponse> Responses { get; set; } = new List<ChallengeResponse>();
}
