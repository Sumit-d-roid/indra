namespace Indra.Api.Infrastructure;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "Indra.Experimental.Lab";
    public string Audience { get; init; } = "Indra.Client";
    public string Key { get; init; } = "LOCAL_DEVELOPMENT_ONLY_REPLACE_THIS_SIGNING_KEY_2026";
    public int ExpirationMinutes { get; init; } = 480;
}
