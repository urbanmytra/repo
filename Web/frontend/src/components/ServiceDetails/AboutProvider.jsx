// src/components/ServiceDetails/AboutProvider.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "../../assets/css/components/ServiceDetails/AboutProvider.module.css";
import {
  FiStar,
  FiMapPin,
  FiClock,
  FiShield,
  FiPhone,
  FiMessageCircle,
  FiAward,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function AboutProvider({ provider }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);

  const handleCall = () => {
    const phoneNumber = provider.phone || "916289795827";
    const sanitized = String(phoneNumber).replace(/[^\d+]/g, "");
    window.location.href = `tel:${sanitized}`;
  };

  const handleMessage = () => {
    const phoneNumber = provider?.phone || "916289795827";
    const sanitized = String(phoneNumber)
      .replace(/[^\d+]/g, "")
      .replace(/^\+/, "");
    const text = encodeURIComponent(
      `Hi ${
        provider?.name || ""
      }, I found your profile and would like to know more about your services.`
    );
    const waUrl = `https://wa.me/${sanitized}?text=${text}`;
    window.open(waUrl, "_blank");
  };

  const getProviderAvatar = () => {
    if (provider?.avatar?.url) {
      return provider.avatar.url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      provider?.name || "Provider"
    )}&background=3b82f6&color=ffffff&size=100`;
  };

  const formatJoinDate = (date) => {
    if (!date) return "Recently joined";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getExperienceText = () => {
    const years = provider?.experience?.years;
    if (!years) return "New to platform";
    if (years === 1) return "1 year experience";
    return `${years}+ years experience`;
  };

  const truncateBio = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!provider) {
    return (
      <section className={s.wrap}>
        <div className={s.loading}>Loading provider information...</div>
      </section>
    );
  }

  return (
    <section className={s.wrap}>
      <div className={s.providerCard}>
        <div className={s.providerHeader}>
          <div className={s.avatar}>
            <img
              src={getProviderAvatar()}
              alt={provider.name}
              className={s.avatarImage}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  provider.name
                )}&background=3b82f6&color=ffffff&size=100`;
              }}
            />
            {provider.verification?.status === "verified" && (
              <div className={s.verifiedBadge}>
                <FiShield />
              </div>
            )}
          </div>

          <div className={s.providerInfo}>
            <h3 className={s.providerName}>Subhajit Dey</h3>
            <p className={s.providerTitle}>
              Professional Service Provider
            </p>

            {/* <div className={s.rating}>
              <div className={s.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < Math.round(provider.ratings?.averageRating || 0) ? s.star : s.starEmpty} 
                  />
                ))}
              </div>
              <span className={s.ratingText}>
                {provider.ratings?.averageRating?.toFixed(1) || '0.0'} ({provider.ratings?.totalReviews || 0} reviews)
              </span>
            </div> */}
          </div>
        </div>

        <div className={s.providerStats}>
          <div className={s.stat}>
            <FiAward className={s.statIcon} />
            <div className={s.statContent}>
              {/* <span className={s.statNumber}>
                {provider.experience?.years || 'New'}
              </span>
              <span className={s.statLabel}>
                {provider.experience?.years ? 'Years Experience' : 'to Platform'}
              </span> */}
              <span className={s.statNumber}>10+</span>
              <span className={s.statLabel}>Years Experience</span>
            </div>
          </div>

          <div className={s.stat}>
            <FiClock className={s.statIcon} />
            <div className={s.statContent}>
              {/* <span className={s.statNumber}>
                {provider.stats?.completedBookings || 0}
              </span>
              <span className={s.statLabel}>Jobs Completed</span> */}
              <span className={s.statNumber}>1000+</span>
              <span className={s.statLabel}>Jobs Completed</span>
            </div>
          </div>

          <div className={s.stat}>
            <FiMapPin className={s.statIcon} />
            <div className={s.statContent}>
              <span className={s.statNumber}>
                {provider.serviceArea?.cities?.[0] || "Multiple"}
              </span>
              <span className={s.statLabel}>Service Area</span>
            </div>
          </div>
        </div>

        <div className={s.providerActions}>
          <button className={s.actionBtn} onClick={handleCall}>
            <FiPhone />
            Call Now
          </button>
          <button className={s.actionBtn} onClick={handleMessage}>
            <FiMessageCircle />
            Message
          </button>
        </div>
      </div>

      <div className={s.aboutSection}>
        <h4 className={s.aboutTitle}>About the Provider</h4>

        {/* Provider Bio */}
        <div className={s.bio}>
          <p>
            {provider.experience?.description
              ? showFullBio
                ? provider.experience.description
                : truncateBio(provider.experience.description)
              : `${
                  provider.name
                } is a professional service provider with ${getExperienceText().toLowerCase()}. 
               Known for quality work and excellent customer service.`}
          </p>
          {provider.experience?.description &&
            provider.experience.description.length > 150 && (
              <button
                className={s.toggleBtn}
                onClick={() => setShowFullBio(!showFullBio)}>
                {showFullBio ? "Show Less" : "Read More"}
              </button>
            )}
        </div>

        {/* Provider Details */}
        <div className={s.details}>
          <div className={s.detail}>
            <FiUser className={s.detailIcon} />
            {/* <span>Member since {formatJoinDate(provider.joinedAt)||years}</span> */}
            <span>Member since initial release</span>
          </div>

          {provider.businessInfo?.businessType && (
            <div className={s.detail}>
              <FiAward className={s.detailIcon} />
              <span>
                {provider.businessInfo.businessType.charAt(0).toUpperCase() +
                  provider.businessInfo.businessType.slice(1)}{" "}
                Business
              </span>
            </div>
          )}

          <div className={s.detail}>
            <FiClock className={s.detailIcon} />
            <span>
              Response time: {provider.stats?.responseTime || "Within 1 hour"}
            </span>
          </div>
        </div>

        {/* Specializations */}
        {provider.specializations && provider.specializations.length > 0 && (
          <div className={s.specializations}>
            <h5 className={s.specializationsTitle}>Specializations</h5>
            <div className={s.specializationsList}>
              {provider.specializations.map((specialization, index) => (
                <span key={index} className={s.specialization}>
                  {specialization}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Skills */}
        {provider.certifications && provider.certifications.length > 0 && (
          <div className={s.certifications}>
            <h5 className={s.certificationsTitle}>Certifications & Skills</h5>
            <div className={s.certificationsList}>
              {provider.certifications.map((cert, index) => (
                <span key={index} className={s.certification}>
                  {cert.name}
                  {cert.verified && <FiShield className={s.verifiedIcon} />}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {provider.serviceArea?.cities &&
          provider.serviceArea.cities.length > 0 && (
            <div className={s.serviceAreas}>
              <h5 className={s.serviceAreasTitle}>Service Areas</h5>
              <div className={s.serviceAreasList}>
                {provider.serviceArea.cities.map((city, index) => (
                  <span key={index} className={s.serviceArea}>
                    <FiMapPin className={s.locationIcon} />
                    {city}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* View Full Profile Link */}
        {/* <div className={s.viewProfile}>
          <Link to={`/provider/${provider._id}`} className={s.viewProfileBtn}>
            View Full Profile
          </Link>
        </div> */}
      </div>
    </section>
  );
}
