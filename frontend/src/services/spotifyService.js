import playlists from "../components/pages/Playlists";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getTestJson = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/testjson`);
        if (!response.ok) {
            throw new Error("Failed to fetch test JSON");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching test JSON:", error);
    }
};

export const getDevices = async () => {
  try {
      const response = await fetch(`${API_BASE_URL}/spotifyRunner/getDevices`, {
          method: 'GET',
          credentials: 'include'
      });
      if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch devices: ${errorMessage}`);
      }
      return await response.json();
  }  catch (error) {
      console.error("Error fetching devices", error);
      return null; // Return null in case of error
  }
};

export const login = () => {
    window.location.href = `${API_BASE_URL}/spotifyRunner/login`;
};

export const checkSpotifyLogin = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/isSpotifyLoggedIn` , {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const isLoggedIn = await response.json();
        return isLoggedIn;
    } catch (error) {
        console.error("Error checking Spotify login login: " + error);
    }
};

export const isPremium = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/isPremium`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const { product } = await response.json(); // Destructure 'product' from JSON response
        return product === 'premium'; // Return true if the user is premium
    } catch (error) {
        console.error("Error checking to see if user has premium: " + error);
    }
};

export const getUserPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/playlists`, {
            method: 'GET',
            credentials: "include"
        })
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const playlistResponse = await response.json();
        return playlistResponse;
    } catch (error) {
        console.error("Error getting user playlist: " + error);
    }
};

export const getLikedSongs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/mylikedsongs`, {
            method: 'GET',
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const getLikedSongsResponse = await response.json();
        return getLikedSongsResponse;
    } catch (error) {
        console.error("Error getting liked songs: " + error);
    }
};

export const getPopPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/popPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const popPlaylist = await response.json();
        return popPlaylist;
    } catch (error) {
        console.error(`Error getting pop playlist: ${error}`);
    }
}

export const getRockPlaylist = async() => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/rockPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const rockPlaylist = await response.json();
        return rockPlaylist;
    } catch(error) {
        console.error(`Error getting rock playlist: ${error}`);
    }
};

export const getHipHopPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/hipHopPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const hipHopPlaylist = await response.json();
        return hipHopPlaylist;
    } catch(error) {
        console.error(`Error getting HipHop playlist: ${error}`);
    }
}

export const queuePlaylist = async (uris, deviceId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/queuePlaylist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({uris, deviceId}),
            credentials: "include", // Important for sending cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to queue playlist");
        }
        return await response.json();
    } catch (error) {
        console.error("Error queue playlist: " + error);
    }
}

export const getSongsFromPlaylists = async (playlists, lowerBound, upperBound) => {
    try {
        const body = {
            playlists,
            lowerBound,
            upperBound
        };

        const response = await fetch(`${API_BASE_URL}/spotifyRunner/getFilteredSongs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: "include", // Important for sending cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to get songs from playlist");
        }
        return await response.json();
    } catch (error) {
        console.error(`Error grabbing songs from playlist: ${error}`);
    }
}

export const getFilteredLikedSongs = async (songIds, lowerBound, upperBound) => {
    try {
        const body = {
            songIds,
            lowerBound,
            upperBound
        };
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/getFilteredLikedSongs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: "include", // Important for sending cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to get songs from playlist");
        }
        return await response.json();

    } catch(error) {
        throw new Error(`Error getting filtered songs: ${error}`);
    }
}



















