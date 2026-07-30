'use client';

import React from 'react';
import ErpHero from '@/components/home/ErpHero';
import VideoSection from '@/components/home/VideoSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import RoomsShowcaseSection from '@/components/home/RoomsShowcaseSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import WhoBenefitsSection from '@/components/home/WhoBenefitsSection';
import ExploreToolsSection from '@/components/home/ExploreToolsSection';
import HowItWorksStepsSection from '@/components/home/HowItWorksStepsSection';
import FaqSection from '@/components/home/FaqSection';
import SubscriptionPlans from '@/components/home/SubscriptionPlans';
import CallToActionBanner from '@/components/home/CallToActionBanner';

export default function HomePage() {
  return (
    <main className="min-h-screen pt-28">
      <ErpHero />
      <VideoSection />
      <ReviewsSection />
      <RoomsShowcaseSection />
      <WhyChooseSection />
      <WhoBenefitsSection />
      <ExploreToolsSection />
      <HowItWorksStepsSection />
      <FaqSection />
      <SubscriptionPlans />
      <CallToActionBanner />
    </main>
  );
}
