import React, { useEffect, useRef, useState } from "react";
import s from "../../assets/css/components/Home/Services.module.css";
import {
  FiTool,
  FiSettings,
  FiShield,
  FiHome,
  FiZap,
  // FiWrench,
  FiArrowRight,
  FiPhone,
} from "react-icons/fi";

const services = [
  {
    icon: <FiTool />,
    title: "Installation",
    description:
      "Professional installation with warranty and maintenance support",
    features: ["Free consultation", "1-year warranty", "Same-day service"],
    color: "#3b82f6",
  },
  {
    icon: <FiSettings />,
    title: "Repair",
    description: "Quick and reliable repair services for all brands and models",
    features: ["24/7 emergency", "Genuine parts", "Expert technicians"],
    color: "#ef4444",
  },
  {
    icon: <FiShield />,
    title: "Maintenance",
    description: "Regular maintenance to keep your AC running efficiently",
    features: ["Scheduled visits", "Performance check", "Cost effective"],
    color: "#10b981",
  },
  {
    icon: <FiHome />,
    title: "Home Security",
    description: "Complete home security system installation and monitoring",
    features: ["Smart cameras", "24/7 monitoring", "Mobile alerts"],
    color: "#f59e0b",
  },
  {
    icon: <FiZap />,
    title: "Electrical Work",
    description: "Safe and certified electrical installations and repairs",
    features: [
      "Licensed electricians",
      "Safety certified",
      "Emergency service",
    ],
    color: "#8b5cf6",
  },
  {
    icon: <FiTool />,
    title: "Appliance Repair",
    description: "Expert repair services for all home appliances",
    features: ["All brands", "Quick diagnosis", "Affordable rates"],
    color: "#06b6d4",
  },
];

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.header} ${isVisible ? s.visible : ""}`}>
          <span className={`badge ${s.badge}`}>
            <FiSettings />
            Our Services
          </span>
          <h2 className="h2">
            Comprehensive <span className={s.highlight}>Home Services</span>
          </h2>
          <p className={s.description}>
            We cover installation, repairs, maintenance, and more with trusted
            professionals. Quality service guaranteed with 24/7 support.
          </p>
        </div>

        <div className={`${s.grid} ${isVisible ? s.visible : ""}`}>
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`${s.item} ${hoveredIndex === idx ? s.hovered : ""}`}
              style={{
                "--delay": `${idx * 0.1}s`,
                "--service-color": service.color,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}>
              <a href="tel:+916289795827">
                <div className={s.itemHeader}>
                  <div className={s.icon}>{service.icon}</div>
                  <div className={s.itemTitle}>
                    <h4>{service.title}</h4>
                    <p className={s.itemDescription}>{service.description}</p>
                  </div>
                </div>

                <div className={s.features}>
                  {service.features.map((feature, i) => (
                    <div key={i} className={s.feature}>
                      <div className={s.featureDot} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={s.itemFooter}>
                  <button className={s.learnMore}>
                    Learn More
                    <FiArrowRight />
                  </button>
                </div>
              </a>
            </div>
          ))}

          <div
            className={`${s.moreCard} ${
              hoveredIndex === services.length ? s.hovered : ""
            }`}
            onMouseEnter={() => setHoveredIndex(services.length)}
            onMouseLeave={() => setHoveredIndex(null)}>
            <div className={s.moreContent}>
              <div className={s.moreIcon}>
                <FiPhone />
              </div>
              <h4>Need Something Else?</h4>
              <p className={s.moreDescription}>
                Tell us what you need and we'll connect you with the right
                professional. No job is too big or small!
              </p>

              <div className={s.moreFeatures}>
                <div className={s.moreFeature}>Custom solutions</div>
                <div className={s.moreFeature}>Expert consultation</div>
                <div className={s.moreFeature}>Competitive pricing</div>
              </div>
            </div>

            <a
              className={`btn btn-primary ${s.moreCta}`}
              href="tel:+916289795827">
              <FiPhone />
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
