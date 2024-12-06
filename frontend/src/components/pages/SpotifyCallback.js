import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        // Extract the code and state from the query string
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code || !state) {
            console.error('Missing code or state in the query string');
            return;
        }

        // Send the code and state to the backend
        const sendCallbackData = async () => {
            try {
                const response = await fetch(`${apiUrl}/spotifyRunner/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code, state }),
                    credentials: 'include', // Important for sending cookies
                });

                if (!response.ok) {
                    throw new Error('Failed to send callback data');
                }

                // Redirect to the home page after successful processing
                navigate('/');
                window.location.reload();
            } catch (error) {
                console.error('Error during callback processing: ', error);
                navigate('/'); // Redirect to error page if something goes wrong
            }
        };

        sendCallbackData();
    }, [apiUrl, navigate]);

    return <div>Processing your request...</div>;
};

export default SpotifyCallback;

