import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check whether user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    closeMenu();
    navigate("/");
  };

  return (
    <header className="nav-wrap">
      <nav className="nav container">

        {/* Logo */}
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">F</span>
          <span>
            Fit<span>Life</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Navigation Links */}
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


          {/* Right Side Buttons */}

          {!isLoggedIn ? (
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