namespace Indra.Api.Models;

public sealed class AdaptationScore : BaseEntity
{
    public decimal CognitiveResonance { get; set; }
    public decimal PatternEntropy { get; set; }
    public decimal AbstractionDepth { get; set; }
}
