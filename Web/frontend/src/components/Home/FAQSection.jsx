import React, { useState, useEffect, useRef } from "react";
import s from "../../assets/css/components/Home/FAQSection.module.css";
import {
  FiChevronDown,
  FiHelpCircle,
  FiMessageCircle,
  FiPhone,
} from "react-icons/fi";

const faqs = [
  {
    q: "What is LG Smart Services?",
    a: "LG Smart Services connects you with reliable, vetted home service professionals for installations, repairs, maintenance, and more. We ensure quality service with 100% satisfaction guarantee.",
    category: "general",
  },
  {
    q: "Are the service providers reliable and qualified?",
    a: "Yes, we thoroughly verify the experience, certifications, and documents of each provider. We also continuously monitor customer reviews and feedback to maintain high standards.",
    category: "quality",
  },
  {
    q: "What if I have an issue with a service provider?",
    a: "Contact our support team anytime through phone, chat, or email. We will immediately coordinate with the provider to resolve any issues and ensure your satisfaction.",
    category: "support",
  },
  {
    q: "How are payments handled?",
    a: "You can pay cash or digitally directly with the provider after service completion. We also offer secure online payment options and will be adding more convenient payment methods soon.",
    category: "payment",
  },
  {
    q: "How do I leave a review?",
    a: "After service completion, we automatically send you a review link via SMS and email. You can rate your experience and provide feedback to help other customers.",
    category: "general",
  },
  {
    q: "Do you offer emergency services?",
    a: "Yes, we provide 24/7 emergency services for urgent repairs like AC breakdowns, electrical issues, and plumbing emergencies. Emergency service charges may apply.",
    category: "service",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.grid} ${isVisible ? s.visible : ""}`}>
          <div className={s.leftColumn}>
            <div className={s.header}>
              <span className={`badge ${s.badge}`}>
                <FiHelpCircle />
                FAQ
              </span>
              <h2 className="h2">
                Frequently Asked <span className={s.highlight}>Questions</span>
              </h2>
              <p className={s.description}>
                Find answers to common questions about our services. Can't find
                what you're looking for? We're here to help!
              </p>
            </div>

            <div className={s.helpCards}>
              <div className={s.helpCard}>
                <div className={s.helpIcon}>
                  <FiMessageCircle />
                </div>
                <div className={s.helpContent}>
                  <h4>Live Chat Support</h4>
                  <p>Get instant help from our support team</p>
                  <button className={s.helpButton}>
                    <a
                      href="https://wa.me/916289795827"
                      target="_blank"
                      rel="noopener noreferrer">
                      Start Chat
                    </a>
                  </button>
                </div>
              </div>

              <div className={s.helpCard}>
                <div className={s.helpIcon}>
                  <FiPhone />
                </div>
                <div className={s.helpContent}>
                  <h4>Call Us Directly</h4>
                  <p>Speak with our experts right away</p>
                  <a href="tel:+918594849303" className={s.helpButton}>
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            <div className={s.contactNote}>
              <p>
                <strong>Still need help?</strong>
                <br />
                <a href="/contact" className={s.contactLink}>
                  Contact our support team
                </a>{" "}
                for personalized assistance.
              </p>
            </div>
          </div>

          <div className={s.rightColumn}>
            <div className={s.faqContainer}>
              {faqs.map((item, index) => (
                <div
                  key={index}
                  className={`${s.faqItem} ${
                    openIndex === index ? s.open : ""
                  }`}
                  style={{ "--delay": `${index * 0.1}s` }}>
                  <button
                    className={s.question}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}>
                    <span className={s.questionText}>{item.q}</span>
                    <div className={s.iconWrapper}>
                      <FiChevronDown
                        className={`${s.chevron} ${
                          openIndex === index ? s.rotated : ""
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={s.answerWrapper}
                    style={{
                      maxHeight: openIndex === index ? "200px" : "0",
                      opacity: openIndex === index ? 1 : 0,
                    }}>
                    <div className={s.answer}>{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
