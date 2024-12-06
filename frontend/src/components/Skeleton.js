import React from "react";
import "./Skeleton.css";

//Just use this to create skeleton css while the screen loads the playlists and liked songs for UX
const Skeleton = () => {
    return (
        <div className="playlist-card skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
        </div>
    );
};

export default Skeleton;