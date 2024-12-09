using Microsoft.EntityFrameworkCore;
using SpotifyRunnerApp.Models;

namespace SpotifyRunnerApp.Services
{
    public class SpotifyUserService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly SpotifyAPIService _spotifyAPIService;

        public SpotifyUserService(ApplicationDbContext dbContext, SpotifyAPIService spotifyAPIService)
        {
            _dbContext = dbContext;
            _spotifyAPIService = spotifyAPIService;
        }

        public async Task UpsertUser(string userId, string accessToken, int expiresIn, string refreshToken)
        {
            try
            {
                var existingUser = await _dbContext.spotify_user.FirstOrDefaultAsync(u => u.Username == userId);

                if (existingUser != null)
                {
                    existingUser.AccessToken = accessToken;
                    existingUser.ExpiresIn = expiresIn;
                    existingUser.RefreshToken = refreshToken;
                    existingUser.CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(); // Update the timestamp

                    _dbContext.spotify_user.Update(existingUser);
                }
                else
                {
                    var newUser = new SpotifyUser
                    {
                        Username = userId,
                        AccessToken = accessToken,
                        ExpiresIn = expiresIn,
                        RefreshToken = refreshToken,
                        CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    };

                    await _dbContext.spotify_user.AddAsync(newUser);
                }

                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception (optional: use a logger here)
                Console.Error.WriteLine($"Error in UpsertUser: {ex.Message}");

                // Handle the error as needed (e.g., returning a specific response or throwing custom exception)
                throw new InvalidOperationException("An error occurred while updating the user.");
            }
        }


        public async Task<string> GetAccessTokenByUsername(string username)
        {
            try
            {
                long current = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var user = await _dbContext.Set<SpotifyUser>().FirstOrDefaultAsync(u => u.Username == username);
                if (user == null)
                {
                    throw new Exception("User not found");
                }

                long created = user.CreatedAt;
                long expired = user.ExpiresIn + created;

                Console.WriteLine("Created: " + created + " Expired: " + expired);
                Console.WriteLine("Old Token: " + user.AccessToken);

                if (expired <= current)
                {
                    // var newToken = await _spotifyAPIService.RefreshAccessToken(user.RefreshToken);
                    //Console.WriteLine("Refresh token info: " + newToken);
                    // await UpsertUser(user.Username, newToken.AccessToken, newToken.ExpiresIn, newToken.RefreshToken);
                    //Console.WriteLine("New Token: " + newToken.AccessToken);
                    //return newToken.AccessToken;
                    return null;
                }

                // Return the existing access token if not expired
                return user.AccessToken;
            }
            catch (Exception ex)
            {
                // Log the exception (optional: use a logger here)
                Console.Error.WriteLine($"Error in GetAccessTokenByUsername: {ex.Message}");

                // Handle the error as needed (e.g., returning a specific response or throwing custom exception)
                throw new InvalidOperationException("An error occurred while fetching the access token.");
            }
        }

    }

}
