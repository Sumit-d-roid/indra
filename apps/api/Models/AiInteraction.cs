using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class AiInteraction : BaseEntity
{
    [MaxLength(80)]
    public string InteractionType { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Prompt { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Response { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Model { get; set; } = string.Empty;
}
