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
    getDevices
} from "../../services/spotifyService";
import SpriteAnimation from '../SpriteAnimation';
import ModalDevices from "../ModalDevices";
import ModalQueue from "../ModalQueue";

const DemoPlaylists = () => {
    //sidebar is used to show the songs for each playlist. Will conditionally show the sidebar based on this bool
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    //this hook attached to the sidebar that way we can use it for a event handler where we click off the
    //sidebar and it closes it for UX
    const sidebarRef = useRef(null);
    //List of songs that will be sent to the service for queueing, ONLY has the uris
    const [songs, setSongs] = useState([]);
    //list of the popSongs from the popPlaylist also retrieved from the backend, including metadata
    const [popSongs, setPopSongs] = useState([]);
    //list of the rockSongs from the rockPlaylist also retrieved from the backend, including metadata
    const [rockSongs, setRockSongs] = useState([]);
    //list of hipHop songs from the hipHopPlaylist also retrieved from the backend, including metadata
    const [hipHopSongs, setHipHopSongs] = useState([]);
    //This is how we know which songs to send based on the current card selected.
    const [currentCard, setCurrentCard] = useState(null);
    //show animation while loading
    const [loading, setLoading] = useState(false);
    //response is used after we queue to show the user it was success
    const [response, setResponse] = useState(null);
    //list of devices that the user for Spotify to queue music. Without a device we cannot queue.
    const [devices, setDevices] = useState([]);
    //used to conditionally render the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    //boolean used to disable the queue button. If the user does not have any devices they cant queue
    const [canQueue, setCanQueue] = useState(false);
    //Used to show the success/failure modal after queue
    const [isModalQueueOpen, setIsModalQueueOpen] = useState(false);

    //The associated pre-made playlists
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

    //onLoad fetch the devices. This function will call fetch devices defined below.
    useEffect(() => {
        fetchDevices();
        //console.log(devices);
        //console.log(isModalOpen);
    }, []);

    //this method will call my getDevices service which calls the backend to check for available devices
    //If the user has a device is will close the modal and set canQueue to true.
    const fetchDevices = async () => {
        try {
            const playableDevices = await getDevices();
            //console.log(playableDevices); // Log the fetched devices
            setDevices(playableDevices);
            //If user has no devices or the return is an empty list set canQueue to false and open the modal
            //showing that they have no devices available. otherwise set the boolean to false for the modal
            //and allow for queue
            if (!playableDevices || playableDevices.devices?.length === 0) {
                setCanQueue(false);
                setIsModalOpen(true);
            } else {
                setIsModalOpen(false);
                setCanQueue(true);
            }
        } catch (error) {
            console.error("Error fetching devices: ", error);
            setIsModalOpen(true);
            setCanQueue(false);
        }
    };

    //based on the card clicked set the songs on the sidebar to show the corresponding playlist
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
            //true if the sidebar is already open and the same playlist was clicked
            const shouldClose = isSidebarOpen && currentCard?.id === card.id;
            //if the same playlist is clicked and the sidebar is already open just close it for UX
            if (shouldClose) {
                setIsSidebarOpen(false);
                return;
            }

            //if the current card is not the new card selected. Otherwise just set the songs for the sidebar and
            //open it
            if (currentCard?.id !== card.id) {
                //close the sidebar
                setIsSidebarOpen(false);
                //set a short timeout to illustrate the animation and reset the songs and change the current
                //playlist selected. Once that is done. Reopen the sidebar
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

    //at this hook for when outside of the sidebar is clicked so that it closes the sidebar
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

    //queue the songs based on a playlist selected
    const handleQueue = async () => {
        //console.log("Queue button clicked");
        try {
            //before queueing make sure we check for available devices. If there are no devices, return
            fetchDevices();
            if (!canQueue) {
                return;
            }
            //start the animation
            setLoading(true);
            //grab the uris from the list of songs based on the playlist selected
            const uris = songs.map((song) => song.uri);
            //console.log(uris)
            //grab a device id. It does not matter which one as Spotify will queue on all devices but this ensures
            //no error on our end
            const deviceId = devices.devices[0]?.id;

            //again if there is no device id return
            if (!deviceId) {
                console.error("No device ID found");
                return;
            }
            //call the service which will queue the playlist
            const result = await queuePlaylist(uris, deviceId);
            setResponse(result);
            //console.log(result);
        } catch (error) {
            console.error(`Failed to queue songs: ${error.message}`);
        } finally {
            //close the animation
            setLoading(false);
            //regardless of outcome show the modal with information on how the queue process went.
            if (canQueue) {
                setIsModalQueueOpen(true);
            }
        }
    };

    //onLoad grab the songs for each respective playlist and map to the cards created above
    useEffect(() => {

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

    //used to convert the time in ms to min and seconds
    const formatDuration = (durationMs) => {
        //60000 comes from 60 (seconds in a minute) * 1000 (milliseconds in a second)
        //dividing the ms by 60,000 will give us the value in minutes. Then we floor it because we dont want a
        //decimal value for the minutes but rather the seconds of a minute which will require some mod
        const minutes = Math.floor(durationMs / 60000);
        //get the remainder of ms by minutes and and divide the minutes by milleseconds to get the exact
        //second in that minute. Since we already have minutes calculated above we only care about the seconds
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        //template literal displaying the value in human time, if seconds is below 10 add a leading zero.
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