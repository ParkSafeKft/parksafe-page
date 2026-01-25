import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import { LanguageToggle } from "./components/LanguageToggle";

function Header() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none">
      <div
        className={`mx-auto max-w-5xl rounded-full transition-all duration-300 pointer-events-auto
          ${scrolled
            ? "bg-white/90 backdrop-blur-xl border border-black/5 shadow-lg shadow-black/5 py-3 px-6"
            : "bg-white/50 backdrop-blur-md border border-white/20 py-4 px-8"
          } flex items-center justify-between`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-xl bg-[#34aa56] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            <img src="/logo.png" alt="P" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900">ParkSafe</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/contact" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LanguageToggle />

          {!loading && (
            <>
              {user ? (
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  {t('nav.profile')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t('nav.login')}
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
