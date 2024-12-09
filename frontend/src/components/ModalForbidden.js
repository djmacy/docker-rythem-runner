import React, {useEffect} from 'react';
import './Modal.css';

const ModalForbidden = ({isOpen, onClose}) => {

    useEffect(() => {
        //Don't add the event listener if modal is not open
        if (!isOpen) return;

        //define the event listener which will close the modal if outside of the area is clicked
        const handleClickOutside = (event) => {
            const modalContainer = document.querySelector('.modal-container');
            const modalOverlay = document.querySelector('.modal-overlay');

            if (modalOverlay && !modalContainer.contains(event.target)) {
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
                <h2 className="modal-title">Tempos Not Available Right Now</h2>
                <p className="modal-text">
                    As of Nov 27, Spotify has limited the applications that can request for BPM for all tracks. Until this app has been approved by Spotify this feature will remain
                    disabled. We apologize for any inconvenience.
                </p>
                <button className="modal-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default ModalForbidden;