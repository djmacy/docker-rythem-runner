import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../images/spotifyRunnerLogo.png";
import './Navbar.css';

const Navbar = ({ isAuthenticated }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Set isScrolled to true if the user scrolls more than 50px down
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="text-logo-container">
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="spotify-text">
                    <span>Rythem</span>
                    <span>Runner</span>
                </div>
            </div>
            <div className="navbar-right">
                <Link to="/">Home</Link>
                {isAuthenticated && <Link to="/playlists">Playlists</Link>}
                {isAuthenticated && <Link to="/likedsongs">Liked Songs</Link>}
            </div>
        </div>
    );
};

export default Navbar;
