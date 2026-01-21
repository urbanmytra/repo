import React from 'react';
import Hero from '../components/Home/Hero';
import Professional from '../components/Home/Professional';
import Services from '../components/Home/Services';
import Featured from '../components/Home/Featured';
import Reviews from '../components/Home/Reviews';
import FAQSection from '../components/Home/FAQSection';

export default function Home() {
  return (
    <main>
      <Hero />
      <Professional />
      <Services />
      <Featured />
      <Reviews />
      <FAQSection />
    </main>
  );
}