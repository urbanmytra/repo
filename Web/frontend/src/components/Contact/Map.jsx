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
            src="https://maps.app.goo.gl/RGGoqmqHu52i7zzK9"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
