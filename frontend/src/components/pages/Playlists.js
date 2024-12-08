import React, {useEffect, useRef, useState} from 'react';
import './Playlists.css';
import PlaylistCard from "../PlaylistCard";
import {getUserPlaylist, getSongsFromPlaylists, queuePlaylist, getDevices} from "../../services/spotifyService";
import SpriteAnimation from "../SpriteAnimation";
import Skeleton from "../Skeleton";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ModalDevices from "../ModalDevices";
import ModalQueue from "../ModalQueue";


const Playlists = () => {
    const [minBpm, setMinBpm] = useState(165);
    const [playlists, setPlaylists] = useState([]);
    const [devices, setDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCards, setSelectedCards] = useState([]);
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [totalTracksSelected, setTotalTracksSelected] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canQueue, setCanQueue] = useState(false);
    const [isModalQueueOpen, setIsModalQueueOpen] = useState(false);
    const [queueResponse, setQueueResponse] = useState(null);



    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoadingPlaylists(true); // Set loading to true before fetching

                const data = await getUserPlaylist();
                //console.log("Fetched playlists data:", data);

                if (data && Array.isArray(data)) {
                    // Filter out null or undefined entries
                    const validPlaylists = data.filter((playlist) => playlist !== null);

                    // Sort valid playlists by name
                    const sortedPlaylists = validPlaylists.sort((a, b) => {
                        const nameA = a.name || ""; // Use an empty string if 'name' is null or undefined
                        const nameB = b.name || "";
                        return nameA.localeCompare(nameB);
                    });

                    setPlaylists(sortedPlaylists);
                } else {
                    console.error("Fetched data is not an array or is empty.");
                    setPlaylists([]); // Set an empty list if data is invalid
                }
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoadingPlaylists(false); // Ensure this is only set after fetch completes
            }
        };
        fetchPlaylists();
       // console.log(playlists)
        fetchDevices();
        //console.log(devices);

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

    // useEffect(() => {
    //
    //     console.log(devices); // This will log when `devices` changes
    // }, [devices]);

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [loading]);

    const formatDuration = (durationMs) => {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const getArtists = (artists) => {
        return artists.map(artist => artist.name).join(', ');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            //console.log('Clicked outside:', event.target);
            //Close the sidebar if preview is clicked again for same button
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSidebarOpen]);

    const filteredPlaylists = playlists.filter((playlist) => playlist.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleFindSongs = async () => {
        if (selectedCards.length > 0) {
           // console.log('pressed');
           // console.log(selectedCards)
            //const playlistIds = selectedCards.map((card) => card.id); // Extract the `id` from each selected card
            const lowerBound = minBpm; // Example lower bound for tempo
            const upperBound = parseInt(minBpm) + 10; // Example upper bound for tempo

            try {
                setIsSidebarOpen(false);
                setLoading(true);
                fetchDevices();
              //  console.log(canQueue);
                if (!canQueue) {
                    setLoading(false);
                    return;
                }
               // console.log('Finding songs with playlists:', selectedCards);
                const filteredSongs = await getSongsFromPlaylists(selectedCards, lowerBound, upperBound);
              //  console.log('Songs with playlists:', songs);
                if (filteredSongs.data?.length === 0) {
                    setSongs([]);
                  //  console.log(songs.length);
                    setError("No songs found matching the criteria."); // Update state for error message
                } else {
                    setSongs(filteredSongs);

                   // console.log('Fetched songs:', filteredSongs);
                }
                setIsSidebarOpen(true);
            } catch (err) {
                console.error('Error fetching songs:', err);
                setError(err.message); // Update error state
            } finally {
                setLoading(false);

            }
        } else {
            console.log('No playlists selected');
        }
    };

    const handleSliderChange = (event) => {
        setMinBpm(parseInt(event.target.value, 10));
    };

    const handleSelect = (id, totalTracks) => {
       // console.log(id + " " + totalTracks);

        setSelectedCards((prevSelected) => {
            if (prevSelected.includes(id)) {
                // Deselect the card: Remove tracks from the total
                setTotalTracksSelected((prevTotal) => prevTotal - totalTracks);
                return prevSelected.filter((cardId) => cardId !== id);
            } else {
                // Select the card: Add tracks to the total
                setTotalTracksSelected((prevTotal) => prevTotal + totalTracks);
                return [...prevSelected, id];
            }
        });
       // console.log(totalTracksSelected)
    };


    const handleSelectAll = () => {
        // Check if all playlists are already selected
        const allSelected = playlists.every((playlist) =>
            selectedCards.includes(playlist.id)
        );

        if (allSelected) {
            // If all are selected, clear the selection
            setSelectedCards([]);
            setTotalTracksSelected(0);
        } else {
            // Otherwise, select all
            const allPlaylistIds = playlists.map((playlist) => playlist.id);
            const totalTracks = playlists.reduce(
                (total, playlist) => total + (playlist.tracks?.total || 0),
                0
            );

            setSelectedCards(allPlaylistIds);
            setTotalTracksSelected(totalTracks); // Update total tracks
        }
    };

    const handleQueue = async () => {
        //console.log("Queue button clicked");

        try {
            fetchDevices();
            if (!canQueue) {
                return;
            }
            setLoading(true);
            const uris = songs.map((song) => song.audioFeature.uri);
            const deviceId = devices.devices[0]?.id;

            if (!deviceId) {
                console.error("No device ID found");
                return; // Handle the case where deviceId is not available
            }
            //console.log('DM: ' + deviceId)
            console.log(uris)
            const result = await queuePlaylist(uris, deviceId);
            setQueueResponse(result);
            //setResponse(result);
           // console.log(result);
        } catch (error) {
            console.log(`Failed to queue songs: ${error.message}`);
        } finally {
            setLoading(false);
            setIsSidebarOpen(false);
            if (canQueue) {
                setIsModalQueueOpen(true); // Ensure the modal opens in case of an error
            }
        }
    };

    const handleRemoveSong = (indexToRemove) => {
        setSongs((prevSongs) => prevSongs.filter((_, index) => index !== indexToRemove));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const updatedSongs = Array.from(songs);
        const [reorderedSong] = updatedSongs.splice(result.source.index, 1);
        updatedSongs.splice(result.destination.index, 0, reorderedSong);

        setSongs(updatedSongs);
      //  console.log(songs);
    };

    return (
        <div className="playlists-container">
            <h2 className="bpm-title">Select BPM/Cadence</h2>
            <div className="slider-container">
                <input
                    type="range"
                    min="125"
                    max="215"
                    step="10"
                    value={minBpm}
                    onChange={handleSliderChange}
                    className="slider"
                />
                <div className="bpm-value">
                    {minBpm}-{minBpm + 10}
                </div>
            </div>

            <div className="playlists-page">
                <img src="/full-logo-framed.svg" style={{marginBottom:"-280px"}} alt="Spotify Logo"/>

                <h1 className="playlists-title">Your Playlists</h1>
                <input
                    type="text"
                    className="playlist-search"
                    placeholder="Search playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="my-playlists-actions">
                    <div className="left-column">
                        <button className="btn select-all" onClick={handleSelectAll}>
                            {selectedCards.length === playlists.length ? ('Deselect All (' + playlists.length + ')') : ('Select All (' + playlists.length + ')')}
                        </button>
                    </div>
                    <div className="right-column">
                        <button className="btn find-songs" onClick={handleFindSongs}
                                disabled={selectedCards.length === 0}>
                            Find Songs
                        </button>
                        <p>
                            Approximate time: {totalTracksSelected / 100 + ' '} Seconds
                        </p>
                    </div>
                </div>
                <div className="playlists-grid">
                    {loadingPlaylists ? (
                        // Show skeletons while loading
                        Array.from({length: 10}).map((_, index) => (
                            <Skeleton key={index}/>
                        ))
                    ) : (
                        // Show actual playlist cards once the data is loaded
                        filteredPlaylists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                id={playlist.id}
                                name={playlist.name}
                                image={playlist.images[0]?.url || ''}
                                totalTracks={parseInt(playlist.tracks?.total) || 0}
                                isSelected={selectedCards.includes(playlist.id)}
                                onSelect={(id) => handleSelect(id, parseInt(playlist.tracks?.total) || 0)} // Pass totalTracks to handleSelect
                            />
                        ))
                    )}
                </div>
            </div>

            <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-content-wrapper">
                    <h2 style={{color: '#fff', textAlign: 'center'}}>Filtered Songs</h2>
                    <p style={{
                        color: '#e0e0e0',
                        textAlign: 'center'
                    }}>{songs.length === 0 ? ('No songs found matching your criteria') : (songs.length + ' Songs Found:')}</p>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="song-list">
                            {(provided) => (
                                <div
                                    className="song-list"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {songs.map((song, index) => (
                                        <Draggable key={song.id || index} draggableId={song.id || `song-${index}`} index={index}>
                                            {(provided) => (
                                                <div
                                                    className="song-item"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <img src={song.metadata.album?.images[0]?.url} alt={song.metadata.name} className="song-image"/>
                                                    <div className="song-details">
                                                        <p className="song-title">{song.metadata.name}</p>
                                                        <p className="song-artist">{getArtists(song.metadata.artists)}</p>
                                                    </div>
                                                    <p className="song-duration">{formatDuration(song.metadata.duration_ms)}</p>
                                                    <button onClick={() => handleRemoveSong(index)} className="remove-song-btn">X</button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Buttons outside the scrollable area */}
                <div className="sidebar-buttons">
                    <button className="pill-button" onClick={handleQueue} disabled={loading || songs.length === 0}>
                        {loading ? 'Queuing...' : 'Queue'}
                    </button>
                    <button className="pill-button" onClick={() => setIsSidebarOpen(false)}>Close</button>
                </div>
            </div>

            {/* Loading overlay with SpriteAnimation */}
            {loading && (
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

export default Playlists;
