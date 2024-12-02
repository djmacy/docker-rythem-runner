import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import DemoPlaylists from "./components/pages/DemoPlaylists";
import Playlists from "./components/pages/Playlists";
import LikedSongs from "./components/pages/LikedSongs";
import ProtectedRoute from './ProtectedRoute';
import SpotifyCallback from './components/pages/SpotifyCallback';
const RoutesComponent = ({ isAuthenticated, isPremium, loading }) => {
    if (loading) {
        return <div>Loading...</div>;
    }

    console.log('Routes - isAuthenticated: ' + isAuthenticated);
    console.log('Routes - isPremium: ' + isPremium);
    console.log('Routes - loading: ' + loading);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/DemoPlaylists"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium} loading={loading}>
                        <DemoPlaylists />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/Playlists"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium} loading={loading}>
                        <Playlists />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/LikedSongs"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isPremium={isPremium} loading={loading}>
                        <LikedSongs />
                    </ProtectedRoute>
                }
            />
            <Route path="/spotifyRunner/callback" element={<SpotifyCallback />} />
        </Routes>
    );
};

export default RoutesComponent;
