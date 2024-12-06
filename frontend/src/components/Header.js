import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { login, checkSpotifyLogin } from "../services/spotifyService";
import './Header.css';
import cardImage from '../images/card1.png';
import cardImage2 from '../images/card2.png';
import cardImage3 from '../images/card3.png';
import Modal from "./Modal";

const Header = () => {
    const navigate = useNavigate();
    //used to open the modal to redirect users to Spotify login
    const [isModalOpen, setModalOpen] = useState(false);

    //sets the modal to closed once triggered
    const handleCloseModal = () => setModalOpen(false);

    //
    const handleLogin = async (url) => {
        try {
            //Calls the service which checks to see if user is logged in. If they are navigate to the correct
            //route otherwise open up the modal.
            const isLoggedIn = await checkSpotifyLogin();
            //console.log('Header.js: '+ isLoggedIn);
            //if they are logged in navigate to route
            if (isLoggedIn) {
                navigate(url);
            } else {
                setModalOpen(true)
            }
        } catch (error) {
            console.error("Error checking Spotify login: " + error);
        }
    };

    //Closes the modal and redirects the user to the Spotify login page for OAuth
    const handleSpotifyLogin = () => {
        setModalOpen(false);
        login();
    }

    return (
        <header className="header">
            <div className="banner">
                <div className="hero-container">
                    <h1 className="text-run">RUN</h1>
                    <h2 className="text-to-the">TO THE</h2>
                    <h1 className="text-beat">BEAT</h1>
                </div>
            </div>
            <div className="spacer"></div> {/* Spacer to create controlled distance */}
            <div className="feature-text">
                <h2 className="feature-title">Features</h2>
                <p className="feature-subtext">
                    Whether you're looking for motivation or just want to keep the beat,
                    Rythem Runner delivers songs that match your running cadence
                </p>
            </div>
            <div className="card-container">
                <div className="card" style={{backgroundImage: `url(${cardImage}`}}>
                    <h3 className="card-title">DEMO PLAYLISTS</h3>
                    <button className="preview-button" onClick={() => handleLogin('/DemoPlaylists')}>Preview</button>
                </div>
                <div className="card" style={{backgroundImage: `url(${cardImage2}`}}>
                    <h3 className="card-title">YOUR PLAYLISTS</h3>
                    <button className="preview-button" onClick={() => handleLogin('/playlists')}>Preview</button>
                </div>
                <div className="card" style={{backgroundImage: `url(${cardImage3}`}}>
                    <h3 className="card-title">YOUR LIKED SONGS</h3>
                    <button className="preview-button" onClick={() => handleLogin('/likedsongs')}>Preview</button>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onLogin={handleSpotifyLogin}
            />
        </header>
    );
};
export default Header;
