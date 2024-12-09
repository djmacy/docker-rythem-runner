using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Web;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Serialization;
using SpotifyRunnerApp.Services;
using SpotifyRunnerApp.Models;
using Microsoft.OpenApi.Services;

namespace spotifyRunnerApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SpotifyRunnerController : ControllerBase
    {
        // Grab the configs so that we can use them for spotify api calls. 
        private readonly IConfiguration _config;
        // Get the psql database services 
        private readonly SpotifyUserService _userService;
        private readonly SpotifyAPIService _spotifyAPIService;

        // constructor for controller to make sure we have the service and configs. Dependency Injection
        public SpotifyRunnerController(IConfiguration config, SpotifyUserService userService, SpotifyAPIService spotifyAPIService)
        {
            _config = config;
            _userService = userService;
            _spotifyAPIService = spotifyAPIService;
        }

        [HttpGet("testjson")]
        public IActionResult TestJson()
        {
           // System.Diagnostics.Debug.WriteLine("Test endpoint hit");
            var data = new
            {
                message = "Hello, this is a test JSON response",
                timestamp = DateTime.Now
            };
            string jsonData = JsonSerializer.Serialize(data);
          // Console.WriteLine(jsonData);
            return Ok(data);
        }

        // spotifyRunner/login endpoint which will redirect us to the spotify auth url. This will allows us to get access or permission to see users spotify information by giving us the authentication code which will
        // be exchanged in the /callback endpoint for the auth token. With the token we can call the spotify api passing it as a header in our calls.
        [HttpGet("login")]
        public IActionResult Login()
        {
            //clear cookies before redirecting
//            foreach (var cookie in Request.Cookies.Keys)
//           {
//                Response.Cookies.Append(cookie, "", new CookieOptions
//                {
//                    Expires = DateTimeOffset.UtcNow.AddDays(-1),
//                    HttpOnly = true,
//                    Secure = true
//                });
//            }
            string clientId = GetConfigValue("Spotify:ClientId");
            //Is used to redirect the user back to our site. Spotify has to know what this is as well and is set up in dev dashboard for spotify.
            string redirectUri = GetConfigValue("Spotify:RedirectUri");
            //Different scopes give us different permissions. See spotify doc for more info.
            string scope = GetConfigValue("Spotify:Scope");
            // Generate a random string to help protect against csrf attacks. Will need to verify that we get this back when we redirect to callback.
            string state = GenerateRandomString(16);
            // store the state in a session so we can check later.
            HttpContext.Session.SetString("OAuthState", state);
            //Console.WriteLine($"Generated OAuthState: {state}");
            // URL used to send the user to the Spotify Login screen and show perm we need in order to run our endpoints.
            string spotifyAuthUrl = _spotifyAPIService.BuildSpotifyAuthUrl(clientId, redirectUri, scope, state);
            // This redirection will take us to the spotify login. If user accepts, spotify will then redirect them back to our site using redirect URI
            // defined above. If they deny then it will also redirect but with deny response. 
            return Redirect(spotifyAuthUrl);
        }

        // As part of the redirection above spotify redirects the user back to the url you specified as redirect_uri during the authorization request
        // In ASP.NET parameters in query string are automatically bound to method parameters so the code and state are coming straight from Spotify
        // response. This endpoint will grab the auth token for us to be able to make api calls to spotify regarding our users music.
        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] OAuthCallbackData callbackData)
        {
            // Check the session variable to make sure the states match.
            var storedState = HttpContext.Session.GetString("OAuthState");
           // Console.WriteLine($"Stored State: {storedState}, Received State: {callbackData.State}");
            if (string.IsNullOrEmpty(callbackData.State) || callbackData.State != storedState)
            {
                return BadRequest("State mismatch error");
            }
            //get rid of it so that we can optimize memory. We wont be needing this anymore.
            HttpContext.Session.Remove("OAuthState");

            // Retrieve configuration values.
            var clientId = GetConfigValue("Spotify:ClientId");
            var clientSecret = GetConfigValue("Spotify:ClientSecret");
            var redirectUri = GetConfigValue("Spotify:RedirectUri");

            // Retrieves the authentication
            var tokenResponse = await _spotifyAPIService.ExchangeCodeForToken(callbackData.Code, clientId, clientSecret, redirectUri);
            if (!tokenResponse.IsSuccessStatusCode)
            {
                return BadRequest("Failed to exchange code for token");
            }

            var jsonResponse = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<TokenResponse>(jsonResponse);
            var userId = await _spotifyAPIService.GetUserIdFromToken(tokenData.AccessToken);

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("Failed to retrieve user id");
            }
            //Store this in order to be able to make calls to db with user id whenever we will need it
            HttpContext.Session.SetString("UserId", userId);
            // Upsert user information
            await _userService.UpsertUser(userId, tokenData.AccessToken, tokenData.ExpiresIn, tokenData.RefreshToken);
          //  Console.WriteLine(new { message = "Access token received", accessToken = tokenData.AccessToken, userId });
            var response = new { status = "success" };
            return Ok(response);
        }

        [HttpGet("myLikedSongs")]
        public async Task<IActionResult> getLikedSongs(int limit = 50, int offset = 0)
        {
            string username = HttpContext.Session.GetString("UserId");
            if (username == null)
            {
                return BadRequest("No username provided");
            }
            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized("Access Token missing or invalid");
            }

            var allSongItems = await _spotifyAPIService.GetAllSavedTracks(accessToken);
            //System.Diagnostics.Debug.Write("All songs with URI: " + allSongIds);
            if (allSongItems.Count == 0)
            {
                return Ok("No saved tracks found.");
            }

            // Retrieve tempos for all songs
            //var tempos = await _spotifyAPIService.GetTemposForTracks(allSongIds, accessToken,100, 150);
            //var lengthQueued = await _spotifyAPIService.QueueSongs(tempos, accessToken, 10);
            //System.Diagnostics.Debug.WriteLine("Duration: " + lengthQueued);
            return Ok(allSongItems);
        }

        [HttpGet("getDevices")]
        public async Task<IActionResult> getDevices()
        {
            try
            {
                string username = HttpContext.Session.GetString("UserId");

                // Check if username exists in the session
                if (username == null)
                {
                    return BadRequest(new { message = "No username provided" });
                }

                // Get access token for the user
                string accessToken = await _userService.GetAccessTokenByUsername(username);

                // Check if the access token is valid
                if (string.IsNullOrEmpty(accessToken))
                {
                    HttpContext.Session.Remove("UserId");
                    return Unauthorized(new { message = "Access Token missing or invalid" });
                }

                // Fetch devices from Spotify API
                var devicesResponse = await _spotifyAPIService.GetDevices(accessToken);

                // Return the devices response
                return Ok(devicesResponse);
            }
            catch (Exception ex)
            {
                // Log the error (optional, could be a more detailed logging solution here)
                Console.Error.WriteLine($"Error in getDevices: {ex.Message}");

                // Return a generic error message with a 500 status code
                return StatusCode(500, new { message = "An error occurred while processing your request", details = ex.Message });
            }
        }


        [HttpGet("isPremium")]
        public async Task<IActionResult> isPremium()
        {
            string username = HttpContext.Session.GetString("UserId");
            if (username == null)
            {
                return BadRequest(new { error = "No username provided" });
            }

            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized(new { error = "AccessToken is missing or invalid" });
            }

            var isPremiumResponse = await _spotifyAPIService.GetUserProfile(accessToken);
            if (isPremiumResponse == null)
            {
                return BadRequest(new { error = "No profile found" });
            }

            // Return JSON object instead of plain string
            return Ok(new { product = isPremiumResponse.Product });
        }



        [HttpGet("playlists")]
        public async Task<IActionResult> GetPlaylists()
        {
            //System.Diagnostics.Debug.WriteLine("GetPlaylists endpoint was called");
            string username = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(username))
            {
                return BadRequest("No username provided");
            }
            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized("Access Token missing or invalid");
            }
            var playlists = await _spotifyAPIService.GetUserPlaylists(accessToken);
            return Ok(playlists);
        }

        [HttpGet("popPlaylist")]
        public async Task<IActionResult> GetPopPlaylists()
        {
            string username = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(username))
            {
                return BadRequest("No username provided");
            }
            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty (accessToken))
            {
                return Unauthorized("Access Token missing or invalid");
            }
            var playlist = await _spotifyAPIService.GetPlaylist(accessToken, "3u2gXjWxzoz550EiXxoXf0");
            return Ok(playlist);
        }

        [HttpGet("hipHopPlaylist")]
        public async Task<IActionResult> GetHipHopPlaylists()
        {
            string username = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(username))
            {
                return BadRequest("No username provided");
            }
            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized("Access Token missing or invalid");
            }
            var playlist = await _spotifyAPIService.GetPlaylist(accessToken, "604OfUu3m6lIx0wBZrTk6K");
            return Ok(playlist);
        }

        [HttpGet("rockPlaylist")]
        public async Task<IActionResult> GetRockPlaylists()
        {
            string username = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(username))
            {
                return BadRequest("No username provided");
            }
            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized("Access Token missing or invalid");
            }
            var playlist = await _spotifyAPIService.GetPlaylist(accessToken, "2vgvyw34rTNAmsAV6eqfHT");
            return Ok(playlist);
        }

        [HttpPost("queuePlaylist")]
        public async Task<IActionResult> QueuePlaylist([FromBody] QueuePlaylistRequest request)
        {
            string username = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "No username provided" });
            }

            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (string.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized(new { message = "Access Token missing or invalid" });
            }

            var queuePlaylistResponse = await _spotifyAPIService.QueueDemoPlaylist(request.Uris, accessToken, request.DeviceId);
            return Ok(queuePlaylistResponse);
        }

        [HttpPost("getFilteredSongs")]
        public async Task<IActionResult> FilterSongs([FromBody] FilterSongsRequest request)
        {
            string username = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "No username provided" });
            }

            string accessToken = await _userService.GetAccessTokenByUsername(username);
            if (String.IsNullOrEmpty(accessToken))
            {
                HttpContext.Session.Remove("UserId");
                return Unauthorized(new { message = "Access Token missing or invalid" });
            }

            try
            {
                // Step 1: Fetch all songs from the playlist
                var songItems = await _spotifyAPIService.GetSongsFromPlaylist(request.Playlists, accessToken);
                if (songItems == null || !songItems.Any())
                {
                    return NotFound(new { message = "No songs found in playlists" });
                }

                // Step 2: Extract track IDs from the song items
                var trackMetadata = songItems
                    .Select(item => item.Track)
                    .Where(track => track != null && !string.IsNullOrEmpty(track.Id)) // Exclude null or invalid tracks
                    .DistinctBy(track => track.Id) // Ensure uniqueness by track ID
                    .ToDictionary(track => track.Id); // Map by track ID for efficient lookup

                var trackIds = trackMetadata.Keys.ToList();

                if (!trackIds.Any())
                {
                    return NotFound(new { message = "No valid track IDs found" });
                }

                // Step 3: Fetch audio features for the extracted track IDs
                var audioFeatures = await _spotifyAPIService.GetTemposForTracks(trackIds, accessToken, request.LowerBound, request.UpperBound);
                if (audioFeatures == null || !audioFeatures.Any())
                {
                    return Ok(new { message = "No audio features found for the specified tracks and bounds", data = new List<AudioFeature>() });
                }

                // Step 4: Combine filtered audio features with track metadata
                var filteredSongs = audioFeatures
                    .Where(feature => feature.Tempo >= request.LowerBound && feature.Tempo <= request.UpperBound) // Filter by tempo range
                    .Select(feature => new
                    {
                        AudioFeature = feature,
                        Metadata = trackMetadata.TryGetValue(feature.Id, out var metadata) ? metadata : null
                    })
                    .Where(combined => combined.Metadata != null) // Ensure only valid combinations are included
                    .ToList();

                // Step 5: Return the combined result
                return Ok(filteredSongs);
            }
            catch (Exception ex)
            {
                // Handle the exception (e.g., logging, custom error response)
                return StatusCode(500, new { message = "An error occurred while filtering your songs.", details = ex.Message });
            }
        }


        [HttpPost("getFilteredLikedSongs")]
        public async Task<IActionResult> FilterLikedSongs([FromBody] FilterLikedSongsRequest request)
        {
            try
            {
                string username = HttpContext.Session.GetString("UserId");
                if (String.IsNullOrEmpty(username))
                {
                    return BadRequest(new { message = "No username provided" });
                }

                string accessToken = await _userService.GetAccessTokenByUsername(username);
                if (String.IsNullOrEmpty(accessToken))
                {
                    HttpContext.Session.Remove("UserId");
                    return Unauthorized(new { message = "Access Token missing or invalid" });
                }

                var trackIds = request.SongIds;
                if (!trackIds.Any())
                {
                    return NotFound(new { message = "No valid track IDs found" });
                }

                // Step 3: Fetch audio features for the extracted track IDs
                var audioFeatures = await _spotifyAPIService.GetTemposForTracks(trackIds, accessToken, request.LowerBound, request.UpperBound);
                if (audioFeatures == null || !audioFeatures.Any())
                {
                    return Ok(new { message = "No audio features found for the specified tracks and bounds", data = new List<AudioFeature>() });
                }

                return Ok(audioFeatures);
            }
            catch (Exception ex)
            {
                // Return a 500 status code with exception details
                return StatusCode(500, new { message = "An error occurred while filtering your songs.", details = ex.Message });
            }
        }


        [HttpGet("isSpotifyLoggedIn")]
        public IActionResult IsSpotifyLoggedIn()
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (String.IsNullOrEmpty(userId))
            {
                return Ok(false);
            }
            return Ok(true);
        }

        private string GetConfigValue(string key) => _config[key];

        private static string GenerateRandomString(int length) // Fixed the method name here
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                                         .Select(s => s[random.Next(s.Length)]) // Fixed case for Length
                                         .ToArray()); // Changed to ToArray() for correct conversion
        }
    }
}
