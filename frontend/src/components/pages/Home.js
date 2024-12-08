import Header from '../Header';
import React, {useEffect, useState} from 'react';
import {checkSpotifyLogin, isPremium} from '../../services/spotifyService';
import ModalPremium from "../ModalPremium";
import SpriteAnimation from "../SpriteAnimation";

const Home = () => {
    //isAuthenticated is used to see if the user is logged in via Spotify OAuth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    //isPremium is used to see if the user has a Spotify Premium Subscription
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    //loading is used to rerender the home page for testing purposes. Will remove this once I add a login feature to the app.
    const [loading, setLoading] = useState(true);
    //used to store the user's username
    const [username, setUsername] = useState('');
    //used to store the user's password
    const [password, setPassword] = useState('');
    //used to allow the user onto the app for testing purposes. Will eventually get rid of this once I finalize project and add
    //log in feature
    const [isAccessGranted, setIsAccessGranted] = useState(false);

    //temp username verification. I know react env are part of the build but I am just trying to prevent random people other than
    //Spotify staff and myself from accessing the website until it is fully finished
    const spotifyUser = process.env.REACT_APP_SPOTIFY_USER;
    const spotifyAccess = process.env.REACT_APP_SPOTIFY_PASS;

    //onLoad check to see if the user is logged in
    useEffect(() => {
        const fetchAuthAndPremiumStatus = async () => {
            try {
                // Check if the user is logged in
                const loginStatus = await checkSpotifyLogin();
                setIsAuthenticated(loginStatus);

                if (loginStatus) {
                    // If logged in, check if the user has premium
                    const premiumStatus = await isPremium();
                    setIsPremiumUser(premiumStatus); // Ensure safe handling of premiumStatus
                    //console.log("Premium Status: " + premiumStatus)
                }
            } catch (error) {
                console.error('Error fetching authentication or premium status:', error);
            } finally {
                setLoading(false);
	        }
        };
        fetchAuthAndPremiumStatus();
    }, []);

    //use this to grant access to the user
    const handleLogin = (e) => {
        e.preventDefault();
        if (username === spotifyUser && password === spotifyAccess) {
            setIsAccessGranted(true);
        } else {
            alert("Incorrect username or password!");
        }
    };

    //if loading return loading text to rerender component
    if(loading) {
        return (
            <div className="loading-overlay">
                <SpriteAnimation/> {/* Render the SpriteAnimation here */}
            </div>
        );
    }

    //if the user does not have access (ie did not login with credentials above) show them this form otherwise render
    //the home page
    if (!isAccessGranted && !isAuthenticated) {
        return (
            <div style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                <h2 style={{marginTop: '100px', color: '#fff'}}>Spotify Staff Login Page</h2>
                <h2 style={{color: '#fff'}}>Please log in to the test server.</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Log In</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <Header/>
            {isAuthenticated && !isPremiumUser ? <ModalPremium /> : null}
        </div>
    );
};

export default Home;
