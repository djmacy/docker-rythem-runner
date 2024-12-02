import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, isPremium, loading, children }) => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('ProtectedRoute - isPremiumUser:', isPremium);
    console.log('ProtectedRoute - loading:', loading); 
        // Wait until the loading is false
    if (loading) {
        return <div>Loading...</div>; // You can show a loading indicator here if necessary
    }

    return isAuthenticated && isPremium ? children : <Navigate to="/" />;

};

export default ProtectedRoute;
