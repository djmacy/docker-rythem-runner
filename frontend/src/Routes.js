import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import DemoPlaylists from "./components/pages/DemoPlaylists";
import Playlists from "./components/pages/Playlists";
import LikedSongs from "./components/pages/LikedSongs";
import ProtectedRoute from './ProtectedRoute';

const RoutesComponent = ({ isAuthenticated, isPremium }) => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/DemoPlaylists"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium}>
                        <DemoPlaylists />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/Playlists"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium}>
                        <Playlists />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/LikedSongs"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium}>
                        <LikedSongs />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default RoutesComponent;
