import React, {useEffect} from 'react';
import './Modal.css';

const ModalDevices = ({isOpen, onClose}) => {

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
              <h2 className="modal-title">No Devices Found</h2>
              <p className="modal-text" style={{ color: '#555' }}>
                  We could not find any available devices connected to Spotify. Please open the Spotify app on your device and try again. You will not be allowed to queue music until we find a device.
              </p>
              <button className="modal-button" onClick={onClose}>
                  Close
              </button>
          </div>
      </div>
    );
}

export default ModalDevices;