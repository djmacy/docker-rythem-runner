import React, {useEffect} from 'react';
import './Modal.css';

const ModalQueue = ({isOpen, onClose, totalQueued}) => {

    useEffect(() => {
        //don't add the event listener if modal is not open
        if (!isOpen) return;
        //define event handler which will close the modal if clicked outside of the modal
        const handleClickOutside = (event) => {
            const modalContainer = document.querySelector('.modal-container');
            const modalOverlay = document.querySelector('.modal-overlay');
            //close the modal if we click outside of it
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
                { totalQueued > 0 ? (
                    <div>
                        <h2 className="modal-title">Finished!</h2>
                        <p className="modal-text" style={{ color: '#555' }}>
                            We finished queueing your selected songs. Please open your Spotify App and enjoy Running To The Rhythm!
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="modal-title">We're Sorry</h2>
                        <p className="modal-text" style={{ color: '#555' }}>
                            Looks like we had an issue queueing songs to your Spotify account. Please try again.
                        </p>
                    </div>
                )}

                <button className="modal-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default ModalQueue;