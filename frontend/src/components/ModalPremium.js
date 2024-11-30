import React, {useEffect} from 'react';
import './Modal.css';

const ModalPremium = ({isOpen, onClose}) => {

    useEffect(() => {
        if (!isOpen) return; // Don't add the event listener if modal is not open

        const handleClickOutside = (event) => {
            const modalContainer = document.querySelector('.modal-container');
            const modalOverlay = document.querySelector('.modal-overlay');

            if (modalOverlay && !modalContainer.contains(event.target)) {
                onClose();
            }
        };

        // Add event listener when modal is open
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup on component unmount or when modal is closed
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // If the modal is not open, return null (nothing is rendered)
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <h2 className="modal-title">You don't have Spotify Premium :(</h2>
                <p className="modal-text">
                   Spotify is telling us you don't have Spotify Premium. Unfortunately to access our features you have to have Spotify Premium. We're sorry for any inconvenience.
                    Please come back once you have Spotify Premium.
                </p>
                <button className="modal-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default ModalPremium;