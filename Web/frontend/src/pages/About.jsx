import React from 'react';
import AboutHero from '../components/About/AboutHero';
import Mission from '../components/About/Mission';
import Vision from '../components/About/Vision';
import Values from '../components/About/Values';
import Team from '../components/About/Team';
import Stats from '../components/About/Stats';

export default function About() {
  return (
    <main>
      <AboutHero />
      <Stats />
      <Mission />
      <Vision />
      <Values />
      {/* <Team /> */}
    </main>
  );
}