using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Indra.Api.Contracts;
using Indra.Api.Infrastructure;
using Indra.Api.Models;
using Indra.Api.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Indra.Api.Services;

public sealed class AuthService(
    IRepository<User> userRepository,
    IPasswordHasher<User> passwordHasher,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await userRepository.Query()
            .FirstOrDefaultAsync(user => user.Email == request.Email || user.Username == request.Username, cancellationToken);

        if (existingUser is not null)
        {
            throw new InvalidOperationException("A cognitive profile with the supplied identity already exists.");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            DisplayName = request.DisplayName,
            CognitiveFocus = request.CognitiveFocus ?? string.Empty
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new AuthResponse(CreateToken(user), ToProfile(user));
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.Query()
            .FirstOrDefaultAsync(candidate => candidate.Email == request.Identity || candidate.Username == request.Identity, cancellationToken);

        if (user is null)
        {
            return null;
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return null;
        }

        return new AuthResponse(CreateToken(user), ToProfile(user));
    }

    public async Task<UserProfileResponse?> GetProfileAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
    {
        var identifier = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(identifier, out var userId))
        {
            return null;
        }

        var user = await userRepository.GetAsync(userId, cancellationToken);
        return user is null ? null : ToProfile(user);
    }

    private string CreateToken(User user)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserProfileResponse ToProfile(User user) =>
        new(user.Id, user.Username, user.Email, user.DisplayName, user.CognitiveFocus);
}
