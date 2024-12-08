import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import DemoPlaylists from "./components/pages/DemoPlaylists";
import Playlists from "./components/pages/Playlists";
import LikedSongs from "./components/pages/LikedSongs";
import ProtectedRoute from './ProtectedRoute';
import SpotifyCallback from './components/pages/SpotifyCallback';
import SpriteAnimation from "./components/SpriteAnimation";

const RoutesComponent = ({ isAuthenticated, isPremium, loading }) => {
    //If loading return loading so that it rerenders. Loading is coming from App.js check to see if user is
    //logged in to spotify. Loading is set to true while the api call is made and then once we have a return
    //we can set to false
    if (loading) {
        return (
            // Show loading screen until data is ready until I change it to the logo running
            <div className="loading-overlay">
                <SpriteAnimation/> {/* Render the SpriteAnimation here */}
            </div>
        )
    }

    // console.log('Routes - isAuthenticated: ' + isAuthenticated);
    // console.log('Routes - isPremium: ' + isPremium);
    // console.log('Routes - loading: ' + loading);

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
