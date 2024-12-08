import React, {useState, useEffect, useRef} from 'react';
import './LikedSongs.css'
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {getDevices, getFilteredLikedSongs, getLikedSongs, queuePlaylist} from "../../services/spotifyService";
import SpriteAnimation from "../SpriteAnimation";
import SongSkeleton from "../SongSkeleton";
import ModalDevices from "../ModalDevices";
import ModalQueue from "../ModalQueue";

const LikedSongs = () => {
    //used to manage the state of the slider
    const [minBpm, setMinBpm] = useState(165);
    //used to know which songs to send over to my backend for filtering
    const [songs, setSongs] = useState([]);
    //used to keep track of available devices for queue process
    const [devices, setDevices] = useState([]);
    //songs that have been filtered to the desired bpm range
    const [filteredSongs, setFilteredSongs] = useState([]);
    //lets us know if the songs have been filtered. If true enable the queue button below
    const [isFiltered, setIsFiltered] = useState(false);
    //if loading show the animation
    const [isLoading, setIsLoading] = useState(false);
    //if true the user can click on the queue button
    const [canQueue, setCanQueue] = useState(false);
    //if true the user can filter music again. Just here to prevent the user from accidentally clicking on filter
    //after they have just filtered the music for UX
    const [canFilter, setCanFilter] = useState(true);
    //conditionally renders text on the page letting the user know that we are currently getting their liked songs.
    //depending on the number of songs could be anywhere from 1-10 sec.
    const [loadingLikedSongs, setLoadingLikedSongs] = useState(false);
    // State to manage the "still loading" message if still retrieving songs after 5 sec
    const [stillLoading, setStillLoading] = useState(false);
    //used to make sure change is not asynchronous. Sometimes states are not changed immediately and we need to know
    //for the process where we get the liked songs
    const loadingRef = useRef(false);
    //used to conditionally show the modal for devices
    const [isModalOpen, setIsModalOpen] = useState(false);
    //used to conditionally show the modal after queue is finished
    const [isModalQueueOpen, setIsModalQueueOpen] = useState(false);
    //let us know if we had success or failure
    const [queueResponse, setQueueResponse] = useState(null);
    const increment = 10;

    //used on load to fetch liked songs from the user
    useEffect(() => {
        //define the loadingTimeout outside of the try so that we can call it in the finally as well
        let loadingTimeout;
        const fetchSongs = async () => {
            try {
                //I tried both but could only get it to work with the ref. Might have to delete the useState
                setLoadingLikedSongs(true);
                loadingRef.current = true;

                // Set a timeout to change the message after 5 seconds if still loading
                loadingTimeout = setTimeout(() => {
                    // Check the ref instead of the state
                    if (loadingRef.current) {
                        //Set a flag to indicate it's still loading. This will trigger the other text to show
                        setStillLoading(true);
                    }
                    //6 sec
                }, 6000);

                const likedSongs = await getLikedSongs();
                //console.log(likedSongs);
                if (likedSongs) {
                    const formattedSongs = likedSongs.map(item => ({
                        id: item.track.id,
                        name: item.track.name,
                        durationMs: item.track.duration_ms,
                        artists: item.track.artists,
                        albumImage: item.track.album?.images?.[0]?.url || '',
                    }));
                    setSongs(formattedSongs);
                    setFilteredSongs(formattedSongs);
                }
            } catch (error) {
                console.error('Failed to fetch liked songs:', error);
            } finally {
                clearTimeout(loadingTimeout); // Clear the timeout once data is fetched or an error occurs
                setLoadingLikedSongs(false);
                loadingRef.current = false; // Reset the ref
                setStillLoading(false); // Reset the still loading flag
            }
        };
        fetchDevices();
        fetchSongs();
    }, []);

    // Standalone fetchDevices function
    const fetchDevices = async () => {
        try {
            const playableDevices = await getDevices();
            setDevices(playableDevices);

            // Show modal if no devices are found
            if (!playableDevices || playableDevices.devices?.length === 0) {
                setCanQueue(false);
                setIsModalOpen(true);
            } else {
                setIsModalOpen(false); // Close modal if devices are found
                setCanQueue(true);
            }
        } catch (error) {
            console.error("Error fetching devices: ", error);
            setIsModalOpen(true); // Optionally open modal on error
            setCanQueue(false);
        }
    };

    //once the slider changes we need to adjust the new value in increments of 10
    const handleSliderChange = (event) => {
        setMinBpm(parseInt(event.target.value, increment));
        setCanFilter(true);
    };

    //This method will call the service which will filter the songs based on the songs selected
    const filterSongs = async () => {
        // lower bound for tempo
        const lowerBound = minBpm;
        // just add 10 to the lower bound and we get the upper bound
        const upperBound = parseInt(minBpm) + increment;
        try {
            setIsLoading(true);

            // Extract only the song IDs
            const songIds = songs.map(song => song.id);

            // Pass only the IDs in the request
            const filteredAudioFeatures = await getFilteredLikedSongs(songIds, lowerBound, upperBound);
            //console.log(filteredAudioFeatures);
            // If no filtered audio features are found, return early
            if (!filteredAudioFeatures || filteredAudioFeatures.data?.length === 0) {
                setFilteredSongs([]);
                setIsFiltered(true); // Still mark as filtered
                setCanFilter(false);
                setIsLoading(false);
                return; // Exit the function
            }
            // Merge filtered audio features with the original songs
            const mergedSongs = songs
                .filter(song => filteredAudioFeatures.some(feature => feature.id === song.id)) // Retain only matched songs
                .map(song => {
                    const feature = filteredAudioFeatures.find(feature => feature.id === song.id);
                    return {
                        ...song,
                        tempo: feature.tempo,
                        uri: feature.uri,
                    };
                });
            //console.log(mergedSongs);
            setFilteredSongs(mergedSongs);
            fetchDevices();
        } catch (error) {
            console.error('Filter failed:', error);
        } finally {
            setIsFiltered(true);
            setCanFilter(false);
            setIsLoading(false);
        }
    };

    //Call the service to queue the filtered songs
    const queueSongs = async () => {
        try {
            //if there are no devices just return early
            fetchDevices();
            if (!canQueue) {
                return;
            }
            //load the animation
            setIsLoading(true);
            const uris = filteredSongs.map((song) => song.uri);
            const deviceId = devices.devices[0]?.id;

            if (!deviceId) {
                console.error("No device ID found");
                return; // Handle the case where deviceId is not available
            }
            //console.log(uris)
            const result = await queuePlaylist(uris, deviceId);
            setQueueResponse(result);
            //setResponse(result);
          // console.log(result);
        } catch (error) {
            console.error(`Failed to queue songs: ${error.message}`);
        } finally {
            setIsLoading(false);
            if (canQueue) {
                // Ensure the modal opens in case of an error
                setIsModalQueueOpen(true);
            }
        }
    };

    //update the filtered songs if the user chose to remove a song from the list
    const handleRemoveSong = (indexToRemove) => {
        setFilteredSongs((prevSongs) => prevSongs.filter((_, index) => index !== indexToRemove));
    };

    //reOrder the queue based on how the user orders the list of songs
    const handleDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const updatedSongs = Array.from(filteredSongs);
        const [reorderedSong] = updatedSongs.splice(result.source.index, 1);
        updatedSongs.splice(result.destination.index, 0, reorderedSong);

        setFilteredSongs(updatedSongs);
        //console.log(filteredSongs);
    };

    const formatDuration = (durationMs) => {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const getArtists = (artists) => {
        return artists.map(artist => artist.name).join(', ');
    };

    return (
        <div className="liked-songs-container">
            <h2 className="liked-bpm-title">Select BPM/Cadence</h2>
            <div className="liked-slider-container">
                <input
                    type="range"
                    min="125"
                    max="215"
                    step="10"
                    value={minBpm}
                    onChange={handleSliderChange}
                    className="liked-slider"
                />
                <div className="liked-bpm-value">
                    {minBpm}-{minBpm + increment}
                </div>
            </div>

            <div className="liked-songs-page">
                <img src="/full-logo-framed.svg" className="spotify-logo" alt="Spotify Logo"/>
                <h1 className="liked-title">Your Liked Songs</h1>

                <div className="my-liked-songs-actions">
                    <div className="liked-left-column">
                        <button className="liked-btn filter-songs" onClick={filterSongs} disabled={!canFilter}>
                            Filter Songs
                        </button>
                    </div>
                    <div className="liked-right-column">
                        <button className="liked-btn queue-songs" onClick={queueSongs} disabled={!isFiltered}>
                            Queue Songs
                        </button>
                        {/*<p>*/}
                        {/*    Approximate time: {totalTracksSelected / 100 + ' '} Seconds*/}
                        {/*</p>*/}
                    </div>
                </div>

                <div className="filtered-liked-songs">
                    <p style={{color: '#e0e0e0', textAlign: 'center'}}>
                        {loadingLikedSongs
                            ? stillLoading
                                ? 'Still grabbing your liked songs, please be patient...'
                                : 'Grabbing your liked songs'
                            : songs.length === 0
                                ? 'Failed to retrieve liked songs'
                                : filteredSongs.length === 0 && songs.length !== 0
                                    ? 'No songs found matching your criteria. Please try adjusting the BPM.'
                                    : `${filteredSongs.length} Songs Found`}
                    </p>

                    {loadingLikedSongs ? (
                        <div className="liked-skeleton-list">
                            {[...Array(5)].map((_, index) => (
                                <SongSkeleton key={index}/>
                            ))}
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="liked-song-list">
                                {(provided) => (
                                    <div
                                        className="liked-song-list"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {filteredSongs.map((song, index) => (
                                            <Draggable key={song.id} draggableId={song.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className="liked-song-item"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <img
                                                            src={song.albumImage}
                                                            alt={song.name}
                                                            className="liked-song-image"
                                                        />
                                                        <div className="liked-song-details">
                                                            <p className="liked-song-title">{song.name}</p>
                                                            <p className="liked-song-artist">{getArtists(song.artists)}</p>
                                                        </div>
                                                        <p className="liked-song-duration">{formatDuration(song.durationMs)}</p>
                                                        <button
                                                            onClick={() => handleRemoveSong(index)}
                                                            className="liked-remove-song-btn"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>


                {/*/!* Buttons outside the scrollable area *!/*/}
                {/*<div className="sidebar-buttons">*/}
                {/*    <button className="pill-button" onClick={handleQueue} disabled={loading || songs.length === 0}>*/}
                {/*        {loading ? 'Queuing...' : 'Queue'}*/}
                {/*    </button>*/}
                {/*    <button className="pill-button" onClick={() => setIsSidebarOpen(false)}>Close</button>*/}
                {/*</div>*/}

            </div>
            {/* Loading overlay with SpriteAnimation */}
            {isLoading && (
                <div className="loading-overlay">
                    <SpriteAnimation/> {/* Render the SpriteAnimation here */}
                    <h2>Queueing Songs</h2>
                </div>
            )}
            <ModalDevices isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <ModalQueue
                isOpen={isModalQueueOpen && !isModalOpen}
                onClose={() => setIsModalQueueOpen(false)}
                totalQueued={queueResponse?.totalQueued} // Pass the totalQueued value from the result
            />
        </div>
    );
};

export default LikedSongs;