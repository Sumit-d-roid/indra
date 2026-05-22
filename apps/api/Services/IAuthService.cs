using System.Security.Claims;
using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse?> GetProfileAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
}
