import React from 'react';
import s from '../../assets/css/components/Contact/Map.module.css';

export default function Map() {
  return (
    <section className={s.wrap}>
      <div className="container">
        <div className={s.mapCard}>
          <iframe
            title="Map"
            className={s.map}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3687.251342026371!2d88.3829407!3d22.4385076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02716509f1b6b1%3A0x51cc43db2ef4259b!2s721%2C%20Nabagram%20Jhil%20Rd%2C%20Nabagram%2C%20Panchpota%2C%20Rajpur%20Sonarpur%2C%20West%20Bengal%20700152!5e0!3m2!1sen!2sin!4v1729082135349!5m2!1sen!2sin"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
