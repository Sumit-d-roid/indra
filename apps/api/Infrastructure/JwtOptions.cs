namespace Indra.Api.Infrastructure;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Indra.Experimental.Lab";
    public string Audience { get; set; } = "Indra.Client";
    public string Key { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 480;
}
