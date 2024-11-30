import React from 'react';
import './SongSkeleton.css';

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