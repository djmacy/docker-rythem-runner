import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, isPremium, children }) => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('ProtectedRoute - isPremiumUser:', isPremium);
    return isAuthenticated && isPremium ? children : <Navigate to="/" />;

};

export default ProtectedRoute;