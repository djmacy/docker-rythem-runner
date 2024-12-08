import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "./components/Navbar";
import RoutesComponent from "./Routes";
import {checkSpotifyLogin, isPremium} from './services/spotifyService';
import SpriteAnimation from "./components/SpriteAnimation";

function App() {
    //This is used to see if the user is logged in to spotify.
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    //This is used to see if the user is a premium subscriber for Spotify. If user is not
    //premium the rest of the app is basically inaccessible.
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    //Used to rerender the routes after we authenticate the user.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthAndPremiumStatus = async () => {
            try {
                //Check if the user is logged in
                const loginStatus = await checkSpotifyLogin();
                setIsAuthenticated(loginStatus);
                //console.log("Login status: ", loginStatus);

                //If the user is logged in (following OAuth flow for Spotify)
                if (loginStatus) {
                    //Call method from services to see if user has premium
                    const premiumStatus = await isPremium();
                    //Change the status
                    setIsPremiumUser(premiumStatus);
                    //console.log("Premium Status: " + premiumStatus)
                }
            } catch (error) {
                console.error('Error fetching authentication or premium status:', error);
            } finally {
                setLoading(false);
               // console.log("Loading state: false");
            }   
        };
        fetchAuthAndPremiumStatus();
    }, []);

    return (
        <Router>
            {loading ? (
                // Show loading screen until data is ready until I change it to the logo running
                    <div className="loading-overlay">
                        <SpriteAnimation/> {/* Render the SpriteAnimation here */}
                    </div>
            ) : (
                <>
                    <Navbar isAuthenticated={isAuthenticated} isPremium={isPremiumUser} />
                    <RoutesComponent isAuthenticated={isAuthenticated} isPremium={isPremiumUser} loading={loading} />
                </>
            )}
        </Router>
    );

}
export default App;