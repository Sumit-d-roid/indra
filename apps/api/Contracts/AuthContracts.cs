using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record RegisterRequest(
    [property: Required, StringLength(64, MinimumLength = 3)] string Username,
    [property: Required, EmailAddress] string Email,
    [property: Required, StringLength(120, MinimumLength = 8)] string Password,
    [property: Required, StringLength(120)] string DisplayName,
    [property: StringLength(240)] string CognitiveFocus);

public sealed record LoginRequest(
    [property: Required] string Identity,
    [property: Required] string Password);

public sealed record AuthResponse(string Token, UserProfileResponse Profile);

public sealed record UserProfileResponse(Guid Id, string Username, string Email, string DisplayName, string CognitiveFocus);
