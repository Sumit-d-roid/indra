using Indra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Indra.Api.Data;

public sealed class IndraDbContext(DbContextOptions<IndraDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<CognitiveEntry> CognitiveEntries => Set<CognitiveEntry>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeResponse> ChallengeResponses => Set<ChallengeResponse>();
    public DbSet<CuriosityNode> CuriosityNodes => Set<CuriosityNode>();
    public DbSet<CuriosityConnection> CuriosityConnections => Set<CuriosityConnection>();
    public DbSet<CognitiveMetric> CognitiveMetrics => Set<CognitiveMetric>();
    public DbSet<AdaptationScore> AdaptationScores => Set<AdaptationScore>();
    public DbSet<AiInteraction> AiInteractions => Set<AiInteraction>();
    public DbSet<TrendSnapshot> TrendSnapshots => Set<TrendSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(user => user.Username).IsUnique();

        modelBuilder.Entity<CognitiveEntry>()
            .HasOne(entry => entry.User)
            .WithMany(user => user.CognitiveEntries)
            .HasForeignKey(entry => entry.UserId);

        modelBuilder.Entity<ChallengeResponse>()
            .HasOne(response => response.User)
            .WithMany(user => user.ChallengeResponses)
            .HasForeignKey(response => response.UserId);

        modelBuilder.Entity<ChallengeResponse>()
            .HasOne(response => response.Challenge)
            .WithMany(challenge => challenge.Responses)
            .HasForeignKey(response => response.ChallengeId);

        modelBuilder.Entity<CuriosityConnection>()
            .HasOne(connection => connection.SourceNode)
            .WithMany(node => node.SourceConnections)
            .HasForeignKey(connection => connection.SourceNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CuriosityConnection>()
            .HasOne(connection => connection.TargetNode)
            .WithMany(node => node.TargetConnections)
            .HasForeignKey(connection => connection.TargetNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CognitiveMetric>().HasIndex(metric => metric.MetricName);
        modelBuilder.Entity<TrendSnapshot>().HasIndex(snapshot => snapshot.Indicator);
    }
}
