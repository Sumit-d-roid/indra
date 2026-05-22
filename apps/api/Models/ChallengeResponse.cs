using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class ChallengeResponse : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid ChallengeId { get; set; }
    public Challenge? Challenge { get; set; }

    [MaxLength(4000)]
    public string ResponseText { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
    public int ReflectionDepth { get; set; }
}
