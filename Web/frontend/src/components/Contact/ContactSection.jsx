import React from "react";
import s from "../../assets/css/components/Contact/ContactSection.module.css";
import { FiShield, FiClock, FiCheckCircle, FiCalendar } from "react-icons/fi";

export default function ContactSection() {
  return (
    <section id="contact" className={`section ${s.wrap}`}>
      <div className="container">
        <div className={s.row}>
          <div className={s.left}>
            <h2 className="h2">Contact Us</h2>
            <p className="muted">Customer Support</p>
            <p className="muted">
              Tell us about your issue, preferred time, and location — we’ll
              reach out fast.
            </p>
          </div>
          <form
            className={s.form}
            action="mailto:aritramukherjee1509@gmail.com"
            method="post"
            encType="text/plain">
            <input className="input" name="Name" placeholder="Enter Name" />
            <input
              className="input"
              name="Email"
              placeholder="Enter Email"
              type="email"
            />
            <input
              className="input"
              name="Purpose"
              placeholder="Enter The Purpose"
            />
            <button className="btn btn-primary" type="submit">
              Send Message →
            </button>
          </form>
        </div>

        <div className={s.features}>
          <span>
            <FiCheckCircle /> Satisfaction Guarantee
          </span>
          <span>
            <FiClock /> 24H Availability
          </span>
          <span>
            <FiShield /> Professional Guarantee
          </span>
          <span>
            <FiCalendar /> Flexible Appointments
          </span>
        </div>
      </div>
    </section>
  );
}
