import React, {useState, useEffect, useRef} from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../images/spotifyRunnerLogo.png";
import './Navbar.css';

const Navbar = ({ isAuthenticated }) => {
    //use this hook to know when to add some background color to the navbar since it is transparent on load.
    const [isScrolled, setIsScrolled] = useState(false);
    const [burger_class, setBurgerClass] = useState("burger-bar unclicked")
    const [menu_class, setMenuClass] = useState("menu")
    const [isMenuClicked, setIsMenuClicked] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const menuRef = useRef(null); // Ref to track menu container
    const location = useLocation();


    //set the event listener onLoad
    useEffect(() => {
        const handleScroll = () => {
            //set isScrolled to true if the user scrolls more than 50px down
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        //cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Function to handle window resize
    const handleResize = () => {
        setWindowWidth(window.innerWidth); // Update window width state
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Update menu visibility based on window width
    useEffect(() => {
        if (windowWidth > 768) {
            setMenuClass("menu hidden");
        }
    }, [windowWidth]);

    const updateMenu = () => {
        if (!isMenuClicked) {
            setBurgerClass("burger-bar clicked")
            setMenuClass("menu visible")
        } else {
            setBurgerClass("burger-bar unclicked")
            setMenuClass("menu hidden")
        }
        setIsMenuClicked(!isMenuClicked);
    }

// Close menu if clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            // Check if the click is outside of both the menu and the burger menu
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                !e.target.closest('.burger-menu') && isMenuClicked
            ) {
                setBurgerClass("burger-bar unclicked");
                setMenuClass("menu hidden");
                setIsMenuClicked(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMenuClicked]);
    // Close the menu when a link is clicked
    const handleLinkClick = () => {
        setBurgerClass("burger-bar unclicked");
        setMenuClass("menu hidden");
        setIsMenuClicked(false);
    };

    // Close the menu programmatically when route changes
    useEffect(() => {
        // This will run every time the location changes
        setBurgerClass("burger-bar unclicked");
        setMenuClass("menu hidden");
        setIsMenuClicked(false);
    }, [location]); // Trigger on location change (route change)

    if (window.innerWidth < 768) {
        return (
            <div>
                <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="text-logo-container">
                        <div className="logo">
                            <img src={logo} alt="Logo"/>
                        </div>
                        <div className="spotify-text">
                            <span>Rythem</span>
                            <span>Runner</span>
                        </div>
                    </div>
                    <div className="burger-menu" onClick={updateMenu}>
                        <div className={burger_class}></div>
                        <div className={burger_class}></div>
                        <div className={burger_class}></div>
                    </div>
                    <div className={menu_class} ref={menuRef}>
                        <div className="menu-centered">
                            <Link to="/" onClick={handleLinkClick}>Home</Link>
                            {isAuthenticated && <Link to="/playlists" onClick={handleLinkClick}>Playlists</Link>}
                            {isAuthenticated && <Link to="/likedsongs" onClick={handleLinkClick}>Liked Songs</Link>}
                        </div>
                    </div>
                </nav>
            </div>
        );
    }


    return (
        <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="text-logo-container">
                <div className="logo">
                    <img src={logo} alt="Logo"/>
                </div>
                <div className="spotify-text">
                    <span>Rythem</span>
                    <span>Runner</span>
                </div>
            </div>
            <div className="navbar-right">
                <Link to="/">Home</Link>
                {isAuthenticated && <Link to="/playlists">Playlists</Link>}
                {isAuthenticated && <Link to="/likedsongs">Liked Songs</Link>}
            </div>
        </div>
    );
};

export default Navbar;
