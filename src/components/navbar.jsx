import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";


function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);

    const [user, setUser] = useState(null);

    const location = useLocation();

    const navigate = useNavigate();


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
            }
        );

        return () => unsubscribe();

    }, []);


    const closeMenu = () => {

        setMenuOpen(false);

    };


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


                <Link
                    className="brand"
                    to="/"
                    onClick={closeMenu}
                >

                    <span className="brand-mark">
                        F
                    </span>

                    <span>
                        Fit<span>Life</span>
                    </span>

                </Link>


                <button
                    className="menu"
                    onClick={() =>
                        setMenuOpen(!menuOpen)
                    }
                >

                    ☰

                </button>


                <div
                    className={`nav-links ${
                        menuOpen ? "show" : ""
                    }`}
                >


                    <Link
                        className={
                            location.pathname === "/"
                                ? "active"
                                : ""
                        }
                        to="/"
                        onClick={closeMenu}
                    >
                        Home
                    </Link>


                    <Link
                        className={
                            location.pathname === "/workouts"
                                ? "active"
                                : ""
                        }
                        to="/workouts"
                        onClick={closeMenu}
                    >
                        Workouts
                    </Link>


                    <Link
                        className={
                            location.pathname === "/nutrition"
                                ? "active"
                                : ""
                        }
                        to="/nutrition"
                        onClick={closeMenu}
                    >
                        Nutrition
                    </Link>


                    <Link
                        className={
                            location.pathname === "/tracking"
                                ? "active"
                                : ""
                        }
                        to="/tracking"
                        onClick={closeMenu}
                    >
                        Tracking
                    </Link>


                    <Link
                        className={
                            location.pathname === "/about"
                                ? "active"
                                : ""
                        }
                        to="/about"
                        onClick={closeMenu}
                    >
                        About
                    </Link>


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