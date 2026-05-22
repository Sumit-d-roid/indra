using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class CognitiveMetric : BaseEntity
{
    [MaxLength(80)]
    public string MetricName { get; set; } = string.Empty;

    public decimal Value { get; set; }

    [MaxLength(120)]
    public string Insight { get; set; } = string.Empty;
}
