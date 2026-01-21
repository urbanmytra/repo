import React from 'react';
import s from '../../assets/css/components/FAQ/Banner.module.css';

export default function Banner() {
  return (
    <section className={`section ${s.wrap}`}>
      <div className="container">
        <div className={s.card}>
          <h2 className="h2">Frequently Asked Questions</h2>
          <p className="muted">If you cannot find an answer, reach our support team.</p>
        </div>
      </div>
    </section>
  );
}