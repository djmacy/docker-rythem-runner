import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, isPremium, loading, children }) => {
    //console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    //console.log('ProtectedRoute - isPremiumUser:', isPremium);
    //console.log('ProtectedRoute - loading:', loading);
    //Wait until the loading is false so that we can rerender the routes. Loading is defined from the App.js
    //when checking if user is logged in to premium (isAuthenticated) and is a premium subscriber (isPremium)
    if (loading) {
        return <div>Loading...</div>; // You can show a loading indicator here if necessary
    }
    //If user is logged in to Spotify and is a premium subscriber we can redirect the user to children (the
    //route that got passed down) else navigate home since we down want the user to access the site.
    return isAuthenticated && isPremium ? children : <Navigate to="/" />;
};
export default ProtectedRoute;