import React from 'react';
import './SongSkeleton.css';

//Just use this to create skeleton css while the screen loads the playlists and liked songs for UX
const SongSkeleton = () => (
    <div className="liked-skeleton-container">
        <div className="liked-skeleton-image"></div>
        <div className="liked-skeleton-details">
            <div className="liked-skeleton-line long"></div>
            <div className="liked-skeleton-line short"></div>
        </div>
    </div>
);

export default SongSkeleton;