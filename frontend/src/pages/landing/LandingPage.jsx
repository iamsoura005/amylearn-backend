import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from '@/components/global/Footer';
import { ScrollToTop } from '@/components/global/ScrollToTop';
import LandingNavbar from '@/pages/landing/components/LandingNavbar';
import HeroSection from '@/pages/landing/components/HeroSection';
import TrustBar from '@/pages/landing/components/TrustBar';
import FeaturesSection from '@/pages/landing/components/FeaturesSection';
import HowItWorksSection from '@/pages/landing/components/HowItWorksSection';
import StakeholderTourSection from '@/pages/landing/components/StakeholderTourSection';
import ComparisonSection from '@/pages/landing/components/ComparisonSection';
import RoiCalculatorSection from '@/pages/landing/components/RoiCalculatorSection';
import FAQSection from '@/pages/landing/components/FAQSection';
import ContactSection from '@/pages/landing/components/ContactSection';
import ClosingCTASection from '@/pages/landing/components/ClosingCTASection';

export const LandingPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return undefined;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="min-h-screen bg-bgLight">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <HowItWorksSection />
        <StakeholderTourSection />
        <ComparisonSection />
        <RoiCalculatorSection />
        <FAQSection />
        <ContactSection />
        <ClosingCTASection />
      </main>
      <Footer tone="dark" />
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
