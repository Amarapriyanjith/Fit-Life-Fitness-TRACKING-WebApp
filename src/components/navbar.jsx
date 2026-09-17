import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoImage from "../assets/images/logo.jpeg";

function Navbar() {
    // State to manage mobile menu open/close status
    const [menuOpen, setMenuOpen] = useState(false);
    
    // State to store the currently authenticated user
    const [user, setUser] = useState(null);
    
    // Hooks for routing and location paths
    const location = useLocation();
    const navigate = useNavigate();

    // Listen to Firebase authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
            }
        );
        // Clean up the subscription on unmount
        return () => unsubscribe();
    }, []);

    // Function to close the mobile menu
    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Handle user logout process with a confirmation prompt
    const handleLogout = async () => {
        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );
        if (!confirmLogout) {
            return;
        }
        try {
            await signOut(auth);
            closeMenu();
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="nav-wrap">
            <nav className="nav container">
                {/* Brand Logo and Name Section */}
                <Link
                    className="brand"
                    to="/"
                    onClick={closeMenu}
                    style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0px" 
                    }}
                >
                    <img 
                        src={logoImage} 
                        alt="FitLife Logo" 
                        style={{ 
                            height: "75px", 
                            width: "auto", 
                            marginRight: "-2px" 
                        }} 
                    />
                    <span>
                        Fit<span>Life</span>
                    </span>
                </Link>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>

                {/* Navigation Links and Authentication Actions */}
                <div className={`nav-links ${menuOpen ? "show" : ""}`}>
                    <Link
                        className={location.pathname === "/" ? "active" : ""}
                        to="/"
                        onClick={closeMenu}
                    >
                        Home
                    </Link>

                    <Link
                        className={location.pathname === "/workouts" ? "active" : ""}
                        to="/workouts"
                        onClick={closeMenu}
                    >
                        Workouts
                    </Link>

                    <Link
                        className={location.pathname === "/nutrition" ? "active" : ""}
                        to="/nutrition"
                        onClick={closeMenu}
                    >
                        Nutrition
                    </Link>

                    <Link
                        className={location.pathname === "/tracking" ? "active" : ""}
                        to="/tracking"
                        onClick={closeMenu}
                    >
                        Tracking
                    </Link>

                    <Link
                        className={location.pathname === "/about" ? "active" : ""}
                        to="/about"
                        onClick={closeMenu}
                    >
                        About
                    </Link>

                    {/* Conditional rendering based on user authentication status */}
                    {!user ? (
                        <>
                            <Link
                                className="nav-login"
                                to="/login"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>

                            <Link
                                className="nav-signup"
                                to="/register"
                                onClick={closeMenu}
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                className="nav-dashboard"
                                to="/dashboard"
                                onClick={closeMenu}
                            >
                                Dashboard
                            </Link>

                            <button
                                className="nav-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;