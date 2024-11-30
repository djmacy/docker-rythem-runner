import React, {useState, useEffect, useRef} from 'react';
import './LikedSongs.css'
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {getDevices, getFilteredLikedSongs, getLikedSongs, queuePlaylist} from "../../services/spotifyService";
import SpriteAnimation from "../SpriteAnimation";
import SongSkeleton from "../SongSkeleton";
import ModalDevices from "../ModalDevices";
import ModalQueue from "../ModalQueue";

const LikedSongs = () => {
    const [minBpm, setMinBpm] = useState(165);
    const [songs, setSongs] = useState([]);
    const [devices, setDevices] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [canQueue, setCanQueue] = useState(false);
    const [canFilter, setCanFilter] = useState(true);
    const [loadingLikedSongs, setLoadingLikedSongs] = useState(false);
    // State to manage the "still loading" message
    const [stillLoading, setStillLoading] = useState(false);
    const loadingRef = useRef(false); // Declare the ref at the top level
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalQueueOpen, setIsModalQueueOpen] = useState(false);
    const [queueResponse, setQueueResponse] = useState(null);


    useEffect(() => {

        let loadingTimeout;

        const fetchSongs = async () => {
            try {
                setLoadingLikedSongs(true);
                loadingRef.current = true; // Update the ref immediately

                // Set a timeout to change the message after 5 seconds if still loading
                loadingTimeout = setTimeout(() => {
                    if (loadingRef.current) { // Check the ref instead of the state
                        setStillLoading(true); // Set a flag to indicate it's still loading
                    }
                }, 6000); // 5 seconds

                const likedSongs = await getLikedSongs();
                console.log(likedSongs);
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



    const handleSliderChange = (event) => {
        setMinBpm(parseInt(event.target.value, 10));
        setCanFilter(true);
    };

    const filterSongs = async () => {
        const lowerBound = minBpm; // Example lower bound for tempo
        const upperBound = parseInt(minBpm) + 10; // Example upper bound for tempo
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
           // console.error('Filter failed:', error);
        } finally {
            setIsFiltered(true);
            setCanFilter(false);
            setIsLoading(false);
        }
    };


    const queueSongs = async () => {
        try {
            fetchDevices();
            if (!canQueue) {
                return;
            }
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
            console.log(result);
        } catch (error) {
            console.log(`Failed to queue songs: ${error.message}`);
        } finally {
            setIsLoading(false);
            if (canQueue) {
                setIsModalQueueOpen(true); // Ensure the modal opens in case of an error
            }
        }
    };

    const handleRemoveSong = (indexToRemove) => {
        setFilteredSongs((prevSongs) => prevSongs.filter((_, index) => index !== indexToRemove));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const updatedSongs = Array.from(filteredSongs);
        const [reorderedSong] = updatedSongs.splice(result.source.index, 1);
        updatedSongs.splice(result.destination.index, 0, reorderedSong);

        setFilteredSongs(updatedSongs);
        console.log(filteredSongs);
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
                    {minBpm}-{minBpm + 10}
                </div>
            </div>

            <div className="liked-songs-page">
                <img src="/full-logo-framed.svg" style={{marginBottom: "-280px"}} alt="Spotify Logo"/>
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