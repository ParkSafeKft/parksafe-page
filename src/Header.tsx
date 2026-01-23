import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import "./Header.css";

function Header() {
  const { user, loading } = useAuth();
  const [showDownloadBtn, setShowDownloadBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show download button after scrolling 50vh (hero section is 90vh)
      const scrolled = window.scrollY > window.innerHeight * 0.5;
      setShowDownloadBtn(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="ParkSafe" className="logo-image" />
          <span className="logo-text">ParkSafe</span>
        </Link>
        <div className="header-actions">
          {showDownloadBtn && (
            <div className="header-download-dropdown">
              <button className="header-download-btn">
                <Download size={18} />
                Letöltés
              </button>
              <div className="download-dropdown-menu">
                <a
                  href="https://apps.apple.com/app/id6752813986"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.parksafe.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play
                </a>
              </div>
            </div>
          )}
          <Link to="/contact" className="contact-button">
            Írj nekünk
          </Link>
          {!loading && (
            <>
              {user ? (
                <Link to="/profile" className="profile-link">
                  Profil
                </Link>
              ) : (
                <Link to="/login" className="login-link">
                  Bejelentkezés
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
