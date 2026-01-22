import React from "react";
import s from "../../assets/css/components/Contact/Map.module.css";

export default function Map() {
  return (
    <section className={s.wrap}>
      <div className="container">
        <div className={s.mapCard}>
          <iframe
            title="Map"
            className={s.map}
            src="https://www.google.com/maps?q=J/37,+Block+J,+Bagha+Jatin+Pally,+Baghajatin+Colony,+Kolkata,+West+Bengal+700032&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
