import React from 'react';
import './PlaylistCard.css';

const PlaylistCard = ({ id, name, image, totalTracks, isSelected, onSelect }) => {
    return (
        <div
            className={`playlist-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(id)} // Handle click on the entire card
        >
            <div className="selection-circle"></div>
            <img src={image} alt={name} className="playlist-image"/>
            <div className="playlist-details">
                <h3 className="playlist-name">{name}</h3>
            </div>
        </div>
    );
};

export default PlaylistCard;
