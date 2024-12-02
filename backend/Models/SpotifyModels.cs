namespace SpotifyRunnerApp.Models
{
    using System.Numerics;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    public class OAuthCallbackData
    {
        public string Code { get; set; }
        public string State { get; set; }
    }
    
    public class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
    }

    // Models/UserProfile.cs
    public class UserProfile
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("product")]
        public string Product { get; set; }
    }

    public class DevicesResponse
    {
        [JsonPropertyName("devices")]
        public List<Devices> Devices { get; set; }
    }

    public class Devices
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("type")]
        public string Type { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }

    // Models/LikedSongsResponse.cs
    public class LikedSongsResponse
    {
        [JsonPropertyName("next")]

        public string Next { get; set; }

        [JsonPropertyName("offset")]

        public int Offset { get; set; }

        [JsonPropertyName("items")]
        public List<SongItem> Items { get; set; }
    }

    public class SongItem
    {
        [JsonPropertyName("track")]
        public Track Track { get; set; }
    }

    public class Track
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("duration_ms")]
        public float MsDuration { get; set; }

        [JsonPropertyName("artists")]
        public List<Artist> Artists { get; set; }

        [JsonPropertyName("album")]
        public Album Album { get; set; }

        [JsonPropertyName("uri")]
        public string Uri { get; set; }
    }

    public class Album
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("images")]
        public List<Image> Image { get; set; }
    }

    public class Image
    {
        [JsonPropertyName("url")]
        public string Url { get; set; }
    }

    public class Artist
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; }
    }

    // Models/AudioFeaturesResponse.cs
    public class AudioFeaturesResponse
    {
        [JsonPropertyName("audio_features")]
        //I dont want all songs so this will run the filter when looping through the response to ensure tempo only in the range of 180-200 are grabbed. This will hopefully make this
        //run more quickly that way I only loop through the response once. 
        public List<AudioFeature> AudioFeatures { get; set; }
    }

    public class AudioFeature
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("tempo")]
        public float Tempo { get; set; }
        [JsonPropertyName("uri")]
        public string Uri { get; set; }
        [JsonPropertyName("duration_ms")]
        public float MsDuration { get; set; }
    }

    public class FilteredAudioFeatureConverter : JsonConverter<List<AudioFeature>>
    {
        private readonly TempoBounds _bounds;

        public FilteredAudioFeatureConverter(TempoBounds bounds)
        {
            _bounds = bounds;
        }

        public override List<AudioFeature> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var features = new List<AudioFeature>();

            // Read the start of the array
            if (reader.TokenType != JsonTokenType.StartArray)
                throw new JsonException();

            // Loop through each item in the array
            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndArray)
                    break;

                // Deserialize the item to AudioFeature
                var feature = JsonSerializer.Deserialize<AudioFeature>(ref reader, options);

                // Only add if tempo is within the desired range
                if (feature?.Tempo >= _bounds.LowerBound && feature.Tempo <= _bounds.UpperBound)
                {
                    features.Add(feature);
                }
            }
            return features;
        }

        public override void Write(Utf8JsonWriter writer, List<AudioFeature> value, JsonSerializerOptions options)
        {
            // Implement if you need to serialize the object back to JSON
            throw new NotImplementedException();
        }
    }

    public class TempoBounds
    {
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
    }

    public class Playlist
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("uri")]
        public string Uri { get; set; }
        [JsonPropertyName("tracks")]
        public TrackObject Tracks { get; set; }
    }

    public class TrackObject 
    {
        [JsonPropertyName("items")]
        public List<SongItem> Items { get; set; }
    }

    public class PlaylistTrack
    {
        [JsonPropertyName("total")]
        public int TotalTracks { get; set; }
    }

    public class PlaylistItems
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("uri")]
        public string Uri { get; set; }
        [JsonPropertyName("images")]
        public List<Image> Image { get; set; }
        [JsonPropertyName("items")]
        public List<SongItem> Items { get; set; }
        [JsonPropertyName("tracks")]
        public PlaylistTrack PlaylistTrack { get; set; }
    }

    public class PlaylistResponse
    {
        [JsonPropertyName("items")]
        public List<PlaylistItems> PlaylistsItems { get; set; }
    }

    public class CustomPlaylistResponse
    {
        [JsonPropertyName("href")]
        public string Href { get; set; }

        [JsonPropertyName("limit")]
        public int Limit { get; set; }

        [JsonPropertyName("next")]
        public string Next { get; set; }

        [JsonPropertyName("offset")]
        public int Offset { get; set; }

        [JsonPropertyName("previous")]
        public string Previous { get; set; }

        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("items")]
        public List<SongItem> Items { get; set; }
    }

    public class FilterSongsRequest
    {
        public List<string> Playlists { get; set; }
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
    }

    public class FilterLikedSongsRequest
    {
        public List<string> SongIds { get; set; }
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
    }

    public class QueuePlaylistRequest
    {
        public List<string> Uris { get; set; }
        public string DeviceId { get; set; }
    }

    public class QueueResult
    {
        public string Uri { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class QueueResponse
    {
        public int TotalQueued { get; set; }
        public List<QueueResult> Failed { get; set; }
    }


}
