using System.Text;
using System.Security.Cryptography;
using Indra.Api.Data;
using Indra.Api.Infrastructure;
using Indra.Api.Models;
using Indra.Api.Repositories;
using Indra.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("indra", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddDbContext<IndraDbContext>(options => options.UseInMemoryDatabase("indra-dev"));
    }
    else
    {
        throw new InvalidOperationException("A relational database connection string must be configured outside development.");
    }
}
else
{
    builder.Services.AddDbContext<IndraDbContext>(options => options.UseNpgsql(connectionString));
}

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwtOptions.Key))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtOptions.Key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
    else
    {
        throw new InvalidOperationException("A JWT signing key must be configured outside development.");
    }
}

builder.Services.Configure<JwtOptions>(options =>
{
    options.Issuer = jwtOptions.Issuer;
    options.Audience = jwtOptions.Audience;
    options.Key = jwtOptions.Key;
    options.ExpirationMinutes = jwtOptions.ExpirationMinutes;
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdaptiveChallengeMutationEngine, AdaptiveChallengeMutationEngine>();
builder.Services.AddScoped<IChallengeAiIntegrationService, StubChallengeAiIntegrationService>();
builder.Services.AddScoped<IChallengeService, ChallengeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ICuriosityGraphService, CuriosityGraphService>();
builder.Services.AddScoped<IShadowModuleService, ShadowModuleService>();
builder.Services.AddScoped<ILabyrinthService, LabyrinthService>();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            title = "INDRA signal fault",
            detail = app.Environment.IsDevelopment() ? exception?.Message : "An unexpected error interrupted the cognitive pipeline."
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<IndraDbContext>();

    if (dbContext.Database.IsRelational())
    {
        dbContext.Database.Migrate();
    }
    else
    {
        dbContext.Database.EnsureCreated();
    }

    await IndraDbSeeder.SeedAsync(dbContext);
}

app.UseCors("indra");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program;
