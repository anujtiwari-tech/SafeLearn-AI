import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TrustSection } from './TrustSection';
import { TestimonialsSection } from './TestimonialsSection';
import { DevicesSection } from './DevicesSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
