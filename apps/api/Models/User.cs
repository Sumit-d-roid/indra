using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class User : BaseEntity
{
    [MaxLength(64)]
    public string Username { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(120)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(240)]
    public string CognitiveFocus { get; set; } = string.Empty;

    public ICollection<CognitiveEntry> CognitiveEntries { get; set; } = new List<CognitiveEntry>();
    public ICollection<ChallengeResponse> ChallengeResponses { get; set; } = new List<ChallengeResponse>();
}
