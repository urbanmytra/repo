import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/css/includes/Navbar.module.css";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/listing", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/bookings", label: "Bookings" },
];

const ThemeIcon = ({ theme, resolvedTheme }) => {
  if (theme === "system") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }

  if (resolvedTheme === "dark") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
};

export default function Navbar({ theme, resolvedTheme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleGetStarted = (e) => {
    e.preventDefault();
    setMenuOpen(false);

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?return=${returnUrl}`);
    } else {
      navigate("/listing");
    }
  };

  const getThemeLabel = () => {
    if (theme === "system") return "System theme";
    return theme === "dark" ? "Dark theme" : "Light theme";
  };

  return (
    <header className={`${styles.wrapper} ${scrolled ? styles.scrolled : ""}`}>
      <nav
        className={styles.nav}
        role="navigation"
        aria-label="Main navigation">
        {/* Brand */}
        <a
          className={styles.brand}
          href="/"
          aria-label="Urban Mytra - Go to homepage">
          <img
            src={resolvedTheme === "dark" ? "/DarkLogo.png" : "/LightLogo.png"}
            alt="Urban Mytra"
            className={styles.brandLogo}
          />
        </a>

        {/* Mobile burger */}
        <button
          className={styles.burger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen(!menuOpen)}>
          <span className={menuOpen ? styles.active : ""} />
          <span className={menuOpen ? styles.active : ""} />
          <span className={menuOpen ? styles.active : ""} />
        </button>

        {/* Links */}
        <div
          id="main-menu"
          className={`${styles.links} ${menuOpen ? styles.open : ""}`}
          role="menu">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.link}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setMenuOpen(false);
                }
              }}>
              {link.label}
            </a>
          ))}

          <div
            className={styles.serviceTag}
            role="status"
            aria-label="24 hour services available">
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.serviceText}>24 Hour Services</span>
          </div>

          <a
            href="/listing"
            className={styles.cta}
            role="menuitem"
            onClick={handleGetStarted}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleGetStarted(e)
            }>
            Get Started
            <span className={styles.arrowCircle} aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </span>
          </a>

          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            title={getThemeLabel()}
            aria-label={getThemeLabel()}
            type="button">
            <ThemeIcon theme={theme} resolvedTheme={resolvedTheme} />
          </button>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </nav>
    </header>
  );
}
