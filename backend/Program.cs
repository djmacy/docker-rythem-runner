using Microsoft.EntityFrameworkCore;
using SpotifyRunnerApp.Models;
using SpotifyRunnerApp.Services;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

// Load appsettings.json and environment variables
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddHttpClient<SpotifyAPIService>();
builder.Services.AddScoped<SpotifyUserService>();
builder.Services.AddScoped<SpotifyAPIService>();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // For cross-origin scenarios
    //options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are always sent over HTTPS
});

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"/app/keys"))
    .SetApplicationName("RythemRunner");

// Configure CORS to allow requests from the React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://3.13.63.222:3000", "https://rythemrunner.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Use this if you need cookies or auth tokens
    });
});

var app = builder.Build();

app.Urls.Add("http://0.0.0.0:5245");

app.UseSession();
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
