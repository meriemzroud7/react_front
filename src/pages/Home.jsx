import Navbar from '../composant/Navbar';
import Footer from '../composant/Footer';
import ChatbotWidget from '../composant/ChatbotWidget';
import Hero from '../sections/Hero';
import Stats from '../sections/Stats';
import Features from '../sections/Features';
import HowItWorks from '../sections/HowItWorks';
import JobListings from '../sections/JobListings';
import OpportunitiesMap from '../sections/OpportunitiesMap';
import Testimonials from '../sections/Testimonials';
import CTA from '../sections/CTA';
import '../styles/sections.css';

export default function Home() {
  return (
    <div id="top">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <JobListings />
        <OpportunitiesMap />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
