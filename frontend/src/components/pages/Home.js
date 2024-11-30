import Header from '../Header';
import {useEffect, useState} from 'react';
import {checkSpotifyLogin, getTestJson, isPremium} from '../../services/spotifyService';
import ModalPremium from "../ModalPremium";

const Home = () => {

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
        <div>
            <Header/>
            {isAuthenticated && !isPremiumUser ? <ModalPremium/> : null}
        </div>

    );
}

export default Home;