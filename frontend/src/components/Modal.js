import React, {useEffect} from 'react';
import './Modal.css';

const Modal = ({isOpen, onClose, onLogin}) => {
    useEffect(() => {
        //don't add the event listener if modal is not open
        if (!isOpen) return;
        //define the event listener to the modal. Essentially is the users clicks outside just close the modal
        const handleClickOutside = (event) => {
            const modalContainer = document.querySelector('.modal-container');
            const modalOverlay = document.querySelector('.modal-overlay');

            if (modalOverlay && !modalContainer.contains(event.target)) {
                //onClose will simply close the modal by setting the value of isOpen to false
                onClose();
            }
        };

        //add event listener when modal is open
        document.addEventListener('mousedown', handleClickOutside);

        //cleanup on component unmount or when modal is closed
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    //if the modal is not open, return null (nothing is rendered)
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