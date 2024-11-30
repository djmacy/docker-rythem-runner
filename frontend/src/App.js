import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "./components/Navbar";
import RoutesComponent from "./Routes";
import {checkSpotifyLogin, isPremium} from './services/spotifyService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);

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
                    console.log("Premium Status: " + premiumStatus)
                }
            } catch (error) {
                console.error('Error fetching authentication or premium status:', error);
            }
        };

        fetchAuthAndPremiumStatus();
    }, []);

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} isPremium={isPremiumUser} />
            <RoutesComponent isAuthenticated={isAuthenticated} isPremium={isPremiumUser} />
        </Router>
    );
}

export default App;