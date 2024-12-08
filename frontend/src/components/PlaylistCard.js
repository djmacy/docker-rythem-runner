import React from 'react';
import './PlaylistCard.css';

const PlaylistCard = ({ id, name, image, totalTracks, isSelected, onSelect }) => {

    //Function to truncate the name if it exceeds 14 characters
    const truncateName = (name) => {
        return name.length > 14 ? name.slice(0, 11) + '...' : name;
    };

    return (
        <div
            className={`playlist-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(id)} // Handle click on the entire card
        >
            <div className="selection-circle"></div>
            <img src={image} alt={name} className="playlist-image" draggable="false"/>
            <div className="playlist-details">
                <h3 className="playlist-name">{truncateName(name)}</h3>
            </div>
        </div>
    );

};

export default PlaylistCard;
