using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class TrendSnapshot : BaseEntity
{
    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(400)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Indicator { get; set; } = string.Empty;
}
