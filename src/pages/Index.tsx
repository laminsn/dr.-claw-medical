import Navbar from "@/components/Navbar";

import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import UnifiedPlatformSection from "@/components/UnifiedPlatformSection";
import InteractiveDemoSection from "@/components/InteractiveDemoSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PersonasSection from "@/components/PersonasSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <UnifiedPlatformSection />
      <InteractiveDemoSection />
      <HowItWorksSection />
      <PersonasSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
