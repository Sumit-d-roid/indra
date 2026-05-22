using System.ComponentModel.DataAnnotations;

namespace Indra.Api.Contracts;

public sealed record RegisterRequest(
    [param: Required, StringLength(64, MinimumLength = 3)] string Username,
    [param: Required, EmailAddress] string Email,
    [param: Required, StringLength(120, MinimumLength = 8)] string Password,
    [param: Required, StringLength(120)] string DisplayName,
    [param: StringLength(240)] string CognitiveFocus);

public sealed record LoginRequest(
    [param: Required] string Identity,
    [param: Required] string Password);

public sealed record AuthResponse(string Token, UserProfileResponse Profile);

public sealed record UserProfileResponse(Guid Id, string Username, string Email, string DisplayName, string CognitiveFocus);
