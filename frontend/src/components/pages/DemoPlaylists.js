import React, {useEffect, useRef, useState} from 'react';

import './DemoPlaylists.css'
import cardImage from "../../images/card5.png";
import cardImage2 from "../../images/card4.png";
import cardImage3 from "../../images/card6.png";
import {
    getPopPlaylist,
    getRockPlaylist,
    getHipHopPlaylist,
    queuePlaylist,
    checkSpotifyLogin, getDevices, getUserPlaylist
} from "../../services/spotifyService";
import SpriteAnimation from '../SpriteAnimation';
import {useNavigate} from "react-router-dom";
import ModalDevices from "../ModalDevices";
import ModalQueue from "../ModalQueue";

const DemoPlaylists = () => {
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [songs, setSongs] = useState([]);
    const [popSongs, setPopSongs] = useState([]);
    const [rockSongs, setRockSongs] = useState([]);
    const [hipHopSongs, setHipHopSongs] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
   // const [uris, setUris] = useState([]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [devices, setDevices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canQueue, setCanQueue] = useState(false);
    const [isModalQueueOpen, setIsModalQueueOpen] = useState(false);


    const cards = [
        {
            id: 1,
            title: "Pop",
            image: cardImage,
            songs: popSongs,
        },
        {
            id: 2,
            title: "Hip Hop",
            image: cardImage2,
            songs: hipHopSongs,
        },
        {
            id: 3,
            title: "Rock",
            image: cardImage3,
            songs: rockSongs,
        },
    ];
    useEffect(() => {
        fetchDevices();
        console.log(devices);
        console.log(isModalOpen);
    }, []);

    const fetchDevices = async () => {
        try {
            const playableDevices = await getDevices();
            console.log(playableDevices); // Log the fetched devices
            setDevices(playableDevices);

            if (!playableDevices || playableDevices.devices?.length === 0) {
                setCanQueue(false);
                setIsModalOpen(true);
            } else {
                setIsModalOpen(false);
                setCanQueue(true);
            }
        } catch (error) {
            console.error("Error fetching devices: ", error);
            setIsModalOpen(true);  // Optionally show modal on error
            setCanQueue(false);
        }
    };

    const toggleSidebar = (card, event) => {
        event.stopPropagation();
        // console.log(card);
        // console.log(currentCard);
        // console.log(isSidebarOpen);
        // console.log(`card Check: ${card === currentCard}`)
        // console.log("Are they deeply equal? ", JSON.stringify(card) === JSON.stringify(currentCard));

        //setIsSidebarOpen(true);
        //Timeout created to hopefully deal with conflict with useEffect handleClickOutside
        setTimeout(() => {
            const shouldClose = isSidebarOpen && currentCard?.id === card.id;

            if (shouldClose) {
                setIsSidebarOpen(false);
                return;
            }

            if (currentCard?.id !== card.id) {
                setIsSidebarOpen(false);
                setTimeout(() => {
                    setSongs(card.songs);
                    setCurrentCard(card);
                    setIsSidebarOpen(true);
                }, 300);
            } else {
                setSongs(card.songs);
                setCurrentCard(card);
                setIsSidebarOpen(true);
            }
        }, 0)
    };

    useEffect(() => {
       const handleClickOutside = (event) => {
           //console.log('Clicked outside:', event.target);
           //Close the sidebar if preview is clicked again for same button
           if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".preview-button")) {
                setIsSidebarOpen(false);
            }
       };

       if (isSidebarOpen) {
           document.addEventListener('mousedown', handleClickOutside);
       }

       return () => {
           document.removeEventListener('mousedown', handleClickOutside);
       }
    }, [isSidebarOpen]);

    const handleQueue = async () => {
        console.log("Queue button clicked");

        try {
            fetchDevices();
            if (!canQueue) {
                return;
            }
            setLoading(true);
            const uris = songs.map((song) => song.uri);
            console.log(uris)
            const deviceId = devices.devices[0]?.id;

            if (!deviceId) {
                console.error("No device ID found");
                return; // Handle the case where deviceId is not available
            }
            const result = await queuePlaylist(uris, deviceId);
            setResponse(result);
            console.log(result);

        } catch (error) {
            console.log(`Failed to queue songs: ${error.message}`);
        } finally {
            setLoading(false);
            if (canQueue) {
                setIsModalQueueOpen(true); // Ensure the modal opens in case of an error
            }
        }
    };

    useEffect(() => {
        // const isLoggedIn = async () => {
        //     const loggedIn = await checkSpotifyLogin();
        //     setLoggedIn(loggedIn);
        // }
        // isLoggedIn();
        // console.log(loggedIn);
        // if (!loggedIn) {
        //     navigate('/');
        //     return;
        // }

        const popPlaylist = async () => {
            const songs = await getPopPlaylist();
            const formattedSongs = songs.tracks.items.map((item) => {
                const track = item.track;
                return {
                    id: track.id,
                    uri: track.uri,
                    title: track.name,
                    artists: track.artists.map((artist) => artist.name).join(', '),
                    duration: formatDuration(track.duration_ms),
                    coverImage: track.album.images[0].url,
                };
            });
            setPopSongs(formattedSongs);
        };
        popPlaylist();

        const rockPlaylist = async () => {
            const songs = await getRockPlaylist();
            //console.log(songs);
            const formattedSongs = songs.tracks.items.map((item) => {
                const track = item.track;
                return {
                    id: track.id,
                    uri: track.uri,
                    title: track.name,
                    artists: track.artists.map((artist) => artist.name).join(', '),
                    duration: formatDuration(track.duration_ms),
                    coverImage: track.album.images[0].url,
                };
            });
            setRockSongs(formattedSongs);
        };
        rockPlaylist();

        const hipHopPlaylist = async () => {
            const songs = await getHipHopPlaylist();
            console.log(songs);
            const formattedSongs = songs.tracks.items.map((item) => {
                const track = item.track;
                return {
                    id: track.id,
                    uri: track.uri,
                    title: track.name,
                    artists: track.artists.map((artist) => artist.name).join(', '),
                    duration: formatDuration(track.duration_ms),
                    coverImage: track.album.images[0].url,
                };
            });
            setHipHopSongs(formattedSongs);
        };
        hipHopPlaylist();
    }, [])

    const formatDuration = (durationMs) => {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    return(

        <div className="demo-playlists-container">
            <div>
                <h1>Demo Playlists</h1>
                <p>Select one of our hand picked playlists for songs at 180 bpm to keep you on track during your next
                    run</p>
            </div>
            <div className="card-container">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{backgroundImage: `url(${card.image})`}}
                    >
                        <h3 className="card-title">{card.title}</h3>
                        <button className="preview-button" onClick={(event) => toggleSidebar(card, event)}>
                            Preview
                        </button>
                    </div>
                ))}
            </div>

            <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-content-wrapper">
                    <h2 style={{color: '#fff'}}>Playlist Preview</h2>
                    <p style={{color: '#e0e0e0'}}>Songs in this playlist:</p>

                    {/* Scrollable song list */}
                    <div className="song-list">
                        {songs.map((song, index) => (
                            <div key={index} className="song-item">
                                <img src={song.coverImage} alt={song.title} className="song-image"/>
                                <div className="song-details">
                                    <p className="song-title">{song.title}</p>
                                    <p className="song-artist">{song.artists}</p>
                                </div>
                                <p className="song-duration">{song.duration}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons outside the scrollable area */}
                <div className="sidebar-buttons">
                    <button className="pill-button" onClick={handleQueue} disabled={loading && canQueue}>
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
                totalQueued={response?.totalQueued} // Pass the totalQueued value from the result
            />
        </div>
    );
}

export default DemoPlaylists;