using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class CuriosityNode : BaseEntity
{
    [MaxLength(120)]
    public string Topic { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Cluster { get; set; } = string.Empty;

    public decimal EngagementWeight { get; set; }

    [MaxLength(160)]
    public string AdjacentDomain { get; set; } = string.Empty;

    [MaxLength(120)]
    public string DriftSignal { get; set; } = string.Empty;

    public ICollection<CuriosityConnection> SourceConnections { get; set; } = new List<CuriosityConnection>();
    public ICollection<CuriosityConnection> TargetConnections { get; set; } = new List<CuriosityConnection>();
}
