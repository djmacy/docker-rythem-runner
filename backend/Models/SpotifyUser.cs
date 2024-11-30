using System.ComponentModel.DataAnnotations.Schema;

namespace SpotifyRunnerApp.Models
{
[Table("spotify_user")]
public class SpotifyUser
{
    [Column("id")]
    public int Id { get; set; }
    
    [Column("username")]
    public string Username { get; set; }
    
    [Column("access_token")]
    public string AccessToken { get; set; }
    
    [Column("expires_in")]
    public int ExpiresIn { get; set; }
    
    [Column("refresh_token")]
    public string RefreshToken { get; set; }
    
    [Column("created_at")]
    public long CreatedAt { get; set; }
}

}
