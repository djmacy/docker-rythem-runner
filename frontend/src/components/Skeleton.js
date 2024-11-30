import React from "react";
import "./Skeleton.css"; // Assuming you will create a CSS file for skeleton styles

const Skeleton = () => {
    return (
        <div className="playlist-card skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
        </div>
    );
};

export default Skeleton;