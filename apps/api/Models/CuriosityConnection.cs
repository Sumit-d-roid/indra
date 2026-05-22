using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Models;

public sealed class CuriosityConnection : BaseEntity
{
    public Guid SourceNodeId { get; set; }
    public CuriosityNode? SourceNode { get; set; }

    public Guid TargetNodeId { get; set; }
    public CuriosityNode? TargetNode { get; set; }

    public decimal Weight { get; set; }

    [MaxLength(80)]
    public string RelationshipType { get; set; } = string.Empty;
}
