import React from 'react';
import s from '../../assets/css/components/Home/Featured.module.css';
import { FiShield, FiFileText, FiMapPin, FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const features = [
  { icon: <FiShield />, title: 'Satisfaction Guarantee', text: "You don't need to worry about scams or performance results. Verified pros with optimal results." },
  { icon: <FiFileText />, title: 'Free Quotes', text: 'Get personalized cost estimates with no obligation. Transparency and peace of mind.' },
  { icon: <FiMapPin />, title: 'Local Professionals', text: 'Experienced local technicians for fast response and quality craftsmanship.' },
  { icon: <FiClock />, title: 'Fast 24‑Hour Service', text: 'Anytime support to quickly resolve urgent problems.' },
  { icon: <FiCalendar />, title: 'Flexible Appointments', text: 'We accommodate busy schedules, day or night, 7 days a week.' },
  { icon: <FiCheckCircle />, title: '100% Commitment‑Free', text: 'Ask us anything about your issues without commitment.' },
];

export default function Featured() {
  return (
    <section className={`section ${s.wrap}`}>
      <div className="container">
        <div className={s.block}>
          <div className={s.head}>
            <h2 className="h2">Fast, Friendly, and Satisfaction Guarantee</h2>
            <p className="muted">
              No matter how big or small your work is—interior or exterior—our team is ready to help you solve home problems.
            </p>
          </div>

          <div className={s.grid}>
            {features.map((f, i) => (
              <div key={i} className={s.item}>
                <div className={s.icon}>{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p className="muted">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}