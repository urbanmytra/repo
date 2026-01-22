import React, { useState } from "react";
import styles from "../assets/css/includes/Footer.module.css";
import {
  FiYoutube,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiArrowUp,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscriptionStatus("loading");

    // Simulate API call
    setTimeout(() => {
      if (email.includes("@")) {
        setSubscriptionStatus("success");
        setEmail("");
        setTimeout(() => setSubscriptionStatus("idle"), 3000);
      } else {
        setSubscriptionStatus("error");
        setTimeout(() => setSubscriptionStatus("idle"), 3000);
      }
    }, 1000);
  };

  const scrollToTop = () => {
    const container = document.querySelector(".main-content");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiYoutube, href: "#", label: "YouTube", color: "#FF0000" },
    { icon: FiInstagram, href: "#", label: "Instagram", color: "#E4405F" },
    { icon: FiFacebook, href: "#", label: "Facebook", color: "#1877F2" },
    { icon: FiTwitter, href: "#", label: "Twitter", color: "#1DA1F2" },
    {
      icon: FiMail,
      href: "mailto:hello@lg.com",
      label: "Email",
      color: "#EA4335",
    },
  ];

  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/listing", label: "Our Services" },
    { href: "/listing", label: "Careers" },
    // { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
  ];

  const legalLinks = [
    // { href: "/terms", label: "Terms of Service" },
    // { href: "/privacy", label: "Privacy Policy" },
    // { href: "/cookies", label: "Cookie Policy" },
    // { href: "/licenses", label: "Licenses" },
  ];

  const supportLinks = [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Help Center" },
    // { href: "/status", label: "Service Status" },
    // { href: "/community", label: "Community" },
    // { href: "/warranty", label: "Warranty" },
  ];

  return (
    <footer className={styles.wrapper} role="contentinfo">
      {/* Newsletter Section */}
      {/* <section className={styles.newsletter} aria-labelledby="newsletter-title">
        <div className="container">
          <div className={styles.newsInner}>
            <div className={styles.newsContent}>
              <h3 id="newsletter-title" className={styles.newsTitle}>
                Stay Connected with Our Newsletter
              </h3>
              <p className={styles.newsDescription}>
                Get the latest updates, exclusive offers, and smart home tips delivered to your inbox.
              </p>
              <div className={styles.newsFeatures}>
                <span className={styles.feature}>
                  <FiCheck size={16} />
                  Weekly tips & tricks
                </span>
                <span className={styles.feature}>
                  <FiCheck size={16} />
                  Exclusive discounts
                </span>
                <span className={styles.feature}>
                  <FiCheck size={16} />
                  New service alerts
                </span>
              </div>
            </div>
            
            <form 
              className={styles.form} 
              onSubmit={handleNewsletterSubmit}
              aria-label="Newsletter subscription"
            >
              <div className={styles.inputWrapper}>
                <input 
                  className={`${styles.emailInput} ${subscriptionStatus === 'error' ? styles.error : ''}`}
                  type="email" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                  disabled={subscriptionStatus === 'loading'}
                />
                {subscriptionStatus === 'error' && (
                  <FiAlertCircle className={styles.inputIcon} />
                )}
                {subscriptionStatus === 'success' && (
                  <FiCheck className={styles.inputIcon} />
                )}
              </div>
              
              <button 
                className={`${styles.subscribeBtn} ${subscriptionStatus === 'loading' ? styles.loading : ''}`}
                type="submit"
                disabled={subscriptionStatus === 'loading' || !email}
                aria-label="Subscribe to newsletter"
              >
                {subscriptionStatus === 'loading' ? (
                  <span className={styles.spinner} />
                ) : subscriptionStatus === 'success' ? (
                  <>
                    <FiCheck size={18} />
                    Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
              
              {subscriptionStatus === 'error' && (
                <p className={styles.errorMessage} role="alert">
                  Please enter a valid email address
                </p>
              )}
              {subscriptionStatus === 'success' && (
                <p className={styles.successMessage} role="status">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>
      </section> */}

      {/* Main Footer Content */}
      <section className={styles.footerMain}>
        <div className="container">
          <div className={styles.cols}>
            {/* Brand Column */}
            <div className={styles.brandCol}>
              <div className={styles.brandRow}>
                <img
                  src={
                    document.documentElement.classList.contains("dark")
                      ? "/DarkLogo.png"
                      : "/LightLogo.png"
                  }
                  alt="Urban Mytra"
                  className={styles.brandLogo}
                />
              </div>

              <p className={styles.brandDescription}>
                Your trusted partner for premium smart home services and
                repairs. We bring innovation and reliability to your doorstep.
              </p>

              {/* Contact Info */}
              <div className={styles.contactInfo}>
                <a
                  href="https://wa.me/916289795827"
                  target="_blank"
                  rel="noopener noreferrer">
                  <div className={styles.contactItem}>
                    <FiPhone size={16} />
                    <span>+91 62897 95827</span>
                  </div>
                </a>
                <a
                  href="https://maps.app.goo.gl/RGGoqmqHu52i7zzK9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactItem}>
                  <FiMapPin size={16} />
                  <span>
                    721, Nabagram Jhil Rd, Nabagram, Panchpota, Rajpur Sonarpur,
                    West Bengal 700152
                  </span>
                </a>

                <div className={styles.contactItem}>
                  <FiClock size={16} />
                  <span>24/7 Emergency Service</span>
                </div>
              </div>

              {/* Social Links */}
              <div className={styles.socials}>
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={styles.socialLink}
                      aria-label={`Follow us on ${social.label}`}
                      style={{ "--social-color": social.color }}>
                      <IconComponent size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Company Links */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Company</h4>
              <ul className={styles.links}>
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className={styles.footerLink}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Legal</h4>
              <ul className={styles.links}>
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className={styles.footerLink}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Support</h4>
              <ul className={styles.links}>
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className={styles.footerLink}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.bottom}>
            <div className={styles.bottomContent}>
              <p className={styles.copyright}>
                © {currentYear} LG Smart Services. All rights reserved.
              </p>

              <div className={styles.bottomLinks}>
                <a
                  href="https://maps.app.goo.gl/RGGoqmqHu52i7zzK9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bottomLink}>
                  Sitemap
                </a>
                {/* <a href="/accessibility" className={styles.bottomLink}>
                  Accessibility
                </a> */}
                <a href="/security" className={styles.bottomLink}>
                  Security
                </a>
              </div>
            </div>

            {/* Back to Top Button */}
            {/* <button 
              className={styles.backToTop}
              onClick={scrollToTop}
              aria-label="Back to top"
              title="Back to top"
            >
              <FiArrowUp size={20} />
            </button> */}
          </div>
        </div>
      </section>
    </footer>
  );
}
