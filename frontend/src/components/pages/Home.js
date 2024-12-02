import Header from '../Header';
import {useEffect, useState} from 'react';
import {checkSpotifyLogin, getTestJson, isPremium} from '../../services/spotifyService';
import ModalPremium from "../ModalPremium";

const Home = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAccessGranted, setIsAccessGranted] = useState(false);

    const spotifyUser = process.env.REACT_APP_SPOTIFY_USER;
    const spotifyAccess = process.env.REACT_APP_SPOTIFY_PASS;

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
            } finally {
                setLoading(false);
	    }
        };

        fetchAuthAndPremiumStatus();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === spotifyUser && password === spotifyAccess) {
            setIsAccessGranted(true);
        } else {
            alert("Incorrect username or password!");
        }
    };

    if(loading) {
        return <div>Loading...</div>;
    }
 
     if (!isAccessGranted && !isAuthenticated) {
        return (
            <div style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                <h2 style={{marginTop: '100px', color: '#fff'}}>App is still under development.</h2>
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
