const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Test script to see if backend is connected. Used for debugging
 * @returns {Promise<any|null>} Json from the backend with information on today's date.
 *  message, timestamp
 */
export const getTestJson = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/testjson`);
        if (!response.ok) {
            throw new Error("Failed to fetch test JSON");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching test JSON:", error);
        return null;
    }
};

/**
 * Calls the backend to see what available devices are currently connected to spotify.
 * @returns {Promise<any|null>} Json with the available devices.
 * devices : [Devices]
 * Devices = { id, type, name}
 */
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
      return null;
  }
};

/**
 * Redirects the user to start the Spotify OAuth flow
 */
export const login = () => {
    window.location.href = `${API_BASE_URL}/spotifyRunner/login`;
};

/**
 * This is used to see if the user is currently authenticated with Spotify
 * @returns {Promise<any>} returns true or false depending on whether the user has a stored session on the
 * backend or not.
 */
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
        return null;
    }
};

/**
 * This is used to see if the user is a premium Spotify member
 * @returns {Promise<boolean>} returns a true or false based on the product key in the Json response.
 */
export const isPremium = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/isPremium`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        //Destructure 'product' from JSON response
        const { product } = await response.json();
        //Return true if the user is premium
        return product === 'premium';
    } catch (error) {
        console.error("Error checking to see if user has premium: " + error);
        return null;
    }
};

/**
 * This service gets a list of the users playlists
 * @returns {Promise<any>} returns a list of PlaylistItems in Json.
 * { [PlaylistItems] }
 * PlaylistsItems = { id, name, uri, images, items, tracks, PlaylistTrack }
 * PlaylistTrack = { total }
 */
export const getUserPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/playlists`, {
            method: 'GET',
            credentials: "include"
        })
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting user playlist: " + error);
        return null;
    }
};

/**
 * This gets the users liked songs
 * @returns {Promise<any|null>} returns a list of SongItems in Json
 * { SongItems }
 * SongItems = { [tracks] }
 * Track = { id, name, duration_ms, [Artist], Album, uri}
 * Artist = { name, id }
 * Album = { id, [Images] }
 * Images = url
 */
export const getLikedSongs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/mylikedsongs`, {
            method: 'GET',
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting liked songs: " + error);
        return null;
    }
};

/**
 * Returns the songs associated with the pre-made pop playlists all filtered to 180 bpm in the DemoPlaylists
 * @returns {Promise<any>} returns a list of songs along with playlist details in Json
 * { id, name, uri, [Tracks] }
 * Track = { id, name, duration_ms, [Artist], Album, uri}
 * Artist = { name, id }
 * Album = { id, [Images] }
 * Images = url
 */
export const getPopPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/popPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error getting pop playlist: ${error}`);
        return null;
    }
}

/**
 * Returns the songs associated with the pre-made rock playlists all filtered to 180 bpm in the DemoPlaylists
 * @returns {Promise<any>} returns a list of songs along with playlist details in Json
 * { id, name, uri, [Tracks] }
 * Track = { id, name, duration_ms, [Artist], Album, uri}
 * Artist = { name, id }
 * Album = { id, [Images] }
 * Images = url
 */
export const getRockPlaylist = async() => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/rockPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch(error) {
        console.error(`Error getting rock playlist: ${error}`);
        return null;
    }
};

/**
 * Returns the songs associated with the pre-made rock playlists all filtered to 180 bpm in the DemoPlaylists
 * @returns {Promise<any>} returns a list of songs along with playlist details in Json
 * { id, name, uri, [Tracks] }
 * Track = { id, name, duration_ms, [Artist], Album, uri}
 * Artist = { name, id }
 * Album = { id, [Images] }
 * Images = url
 */
export const getHipHopPlaylist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/spotifyRunner/hipHopPlaylist`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch(error) {
        console.error(`Error getting HipHop playlist: ${error}`);
    }
}

/**
 * Post request made to the backend to queue the selected songs on a specified device using the tracks uris.
 * @param uris - unique to each song, this is how Spotify knows what songs to queue.
 * @param deviceId - device that is currently active and can accept request from Spotify.
 * @returns {Promise<any>} Returns the number of successful and failed queues.
 * { TotalQueued, Failed }
 */
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

/**
 * This service will get the songs in a give bpm range given a list of songs
 * @param playlists list of song ids
 * @param lowerBound lower bound of the bpm
 * @param upperBound upper bound of bpm
 * @returns {Promise<any>} List songs that fall in the desired range of bpm
 * { AudioFeatures, MetaData }
 * AudioFeatures has bpm while metadata has info to connect back to the song we have stored on the frontend
 */
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

/**
 * This service will get the songs in a give bpm range given a list of songs
 * @param songIds list of song ids
 * @param lowerBound lower bound of the bpm
 * @param upperBound upper bound of bpm
 * @returns {Promise<any>} List songs that fall in the desired range of bpm
 * { AudioFeatures, MetaData }
 * AudioFeatures has bpm while metadata has info to connect back to the song we have stored on the frontend
 */
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