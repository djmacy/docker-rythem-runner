import React, {useEffect} from 'react';
import './Modal.css';

const Modal = ({isOpen, onClose, onLogin}) => {

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
              <h2 className="modal-title">Spotify Login</h2>
              <p className="modal-text">
                  Logging into your Spotify account is required to access features. Discover playlists or enter your own playlists that match your running cadence and keep the beat!
              </p>
              <button className="modal-button" onClick={onLogin }>
                  Login with Spotify
              </button>
          </div>
      </div>
    );
}

export default Modal;