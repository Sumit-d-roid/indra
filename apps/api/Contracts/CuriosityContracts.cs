namespace Indra.Api.Contracts;

public sealed record CuriosityNodeResponse(Guid Id, string Topic, string Cluster, decimal EngagementWeight, string AdjacentDomain, string DriftSignal);

public sealed record CuriosityConnectionResponse(Guid Id, Guid SourceNodeId, Guid TargetNodeId, decimal Weight, string RelationshipType);

public sealed record CuriosityGraphResponse(IReadOnlyCollection<CuriosityNodeResponse> Nodes, IReadOnlyCollection<CuriosityConnectionResponse> Connections);
