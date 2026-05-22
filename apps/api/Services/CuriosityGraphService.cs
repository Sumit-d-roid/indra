using Indra.Api.Contracts;
using Indra.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Services;

public sealed class CuriosityGraphService(IndraDbContext dbContext) : ICuriosityGraphService
{
    public async Task<CuriosityGraphResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var nodes = await dbContext.CuriosityNodes
            .OrderByDescending(node => node.EngagementWeight)
            .Select(node => new CuriosityNodeResponse(node.Id, node.Topic, node.Cluster, node.EngagementWeight, node.AdjacentDomain, node.DriftSignal))
            .ToListAsync(cancellationToken);

        var connections = await dbContext.CuriosityConnections
            .Select(connection => new CuriosityConnectionResponse(connection.Id, connection.SourceNodeId, connection.TargetNodeId, connection.Weight, connection.RelationshipType))
            .ToListAsync(cancellationToken);

        return new CuriosityGraphResponse(nodes, connections);
    }
}
